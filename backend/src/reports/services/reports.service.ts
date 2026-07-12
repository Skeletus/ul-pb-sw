import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { MachineStatus, Prisma } from '@prisma/client';
import {
  getLocalDateTime,
  getWorkdayRange,
  overlapInHours,
  previousCalendarDate,
  WorkdayConfiguration,
} from '../../common/utils/time.util';
import { PrismaService } from '../../prisma/prisma.service';
import { DailyReportQueryDto } from '../dto/daily-report-query.dto';
import { ListDailyReportsQueryDto } from '../dto/list-daily-reports-query.dto';
import { UsageComparisonQueryDto } from '../dto/usage-comparison-query.dto';
// pdfkit exposes a CommonJS constructor and has no runtime default export.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PDFDocument = require('pdfkit');

type StateRecordLike = {
  status: MachineStatus;
  startDate: Date;
  endDate: Date | null;
};

type StoredReport = Prisma.ReportGetPayload<{
  include: {
    machine: { include: { site: true } };
    inactivityCosts: true;
  };
}>;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  readonly workdayConfiguration: WorkdayConfiguration;
  private readonly lowUtilizationThreshold: number;

  constructor(
    private readonly prisma: PrismaService,
    configService?: ConfigService,
  ) {
    this.workdayConfiguration = {
      startTime: configService?.get<string>('WORKDAY_START') ?? '08:00',
      endTime: configService?.get<string>('WORKDAY_END') ?? '17:00',
      timeZone: configService?.get<string>('WORK_TIMEZONE') ?? 'America/Lima',
    };
    getWorkdayRange('2026-01-01', this.workdayConfiguration);
    this.lowUtilizationThreshold = Number(
      configService?.get('LOW_UTILIZATION_THRESHOLD_PERCENT') ?? 40,
    );
  }

  async generateDailyReport(query: DailyReportQueryDto) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: query.machineId },
      include: { site: true },
    });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const { startDate, endDate } = this.getReportRange(query.date);
    const stateRecords = await this.prisma.machineStateRecord.findMany({
      where: {
        machineId: query.machineId,
        startDate: { lt: endDate },
        OR: [{ endDate: null }, { endDate: { gt: startDate } }],
      },
      orderBy: { startDate: 'asc' },
    });

    const usage = this.calculateUsageHours(stateRecords, startDate, endDate);
    const contractRate = Number(machine.hourlyRate);
    const inactivityCostAmount = this.calculateInactivityCost(usage.inactiveHours, contractRate);
    const decimal = (value: number) => new Prisma.Decimal(value.toFixed(2));

    const report = await this.prisma.$transaction(async (transaction) => {
      const persistedReport = await transaction.report.upsert({
        where: {
          machineId_type_startDate_endDate: {
            machineId: machine.id,
            type: 'DAILY',
            startDate,
            endDate,
          },
        },
        update: {
          siteId: machine.siteId,
          generatedAt: new Date(),
          activeHours: decimal(usage.activeHours),
          inactiveHours: decimal(usage.inactiveHours),
          totalClassifiedHours: decimal(usage.totalClassifiedHours),
          effectiveUsagePercentage:
            usage.effectiveUsagePercentage === null
              ? null
              : decimal(usage.effectiveUsagePercentage),
        },
        create: {
          siteId: machine.siteId,
          machineId: machine.id,
          type: 'DAILY',
          startDate,
          endDate,
          activeHours: decimal(usage.activeHours),
          inactiveHours: decimal(usage.inactiveHours),
          totalClassifiedHours: decimal(usage.totalClassifiedHours),
          effectiveUsagePercentage:
            usage.effectiveUsagePercentage === null
              ? null
              : decimal(usage.effectiveUsagePercentage),
        },
      });
      await transaction.inactivityCost.upsert({
        where: {
          reportId_machineId: { reportId: persistedReport.id, machineId: machine.id },
        },
        update: {
          inactiveHours: decimal(usage.inactiveHours),
          contractRate: decimal(contractRate),
          amount: decimal(inactivityCostAmount),
        },
        create: {
          reportId: persistedReport.id,
          machineId: machine.id,
          inactiveHours: decimal(usage.inactiveHours),
          contractRate: decimal(contractRate),
          amount: decimal(inactivityCostAmount),
        },
      });
      return transaction.report.findUniqueOrThrow({
        where: { id: persistedReport.id },
        include: {
          machine: { include: { site: true } },
          inactivityCosts: true,
        },
      });
    });

    return this.toDailyReportResponse(report, query.date);
  }

  async findGeneratedDailyReports(query: ListDailyReportsQueryDto) {
    const range = query.date ? this.getReportRange(query.date) : null;
    const fromRange = query.from ? this.getReportRange(query.from) : null;
    const toRange = query.to ? this.getReportRange(query.to) : null;
    const reports = await this.prisma.report.findMany({
      where: {
        type: 'DAILY',
        machineId: query.machineId,
        startDate: range?.startDate ?? (fromRange ? { gte: fromRange.startDate } : undefined),
        endDate: range?.endDate ?? (toRange ? { lte: toRange.endDate } : undefined),
      },
      include: {
        machine: { include: { site: true } },
        inactivityCosts: true,
      },
      orderBy: [{ startDate: 'desc' }, { machineId: 'asc' }],
    });
    return reports.map((item) => this.toDailyReportResponse(item));
  }

  async getSavingsProjection(machineId: number, startDate: string, endDate: string) {
    const comparison = await this.getUsageComparison({ from: startDate, to: endDate });
    const machine = comparison.machines.find((item) => item.machineId === machineId);
    const currentInactivityCost = machine?.inactivityCost ?? 0;
    const targetReductionRate = 0.2;
    return {
      machineId,
      startDate,
      endDate,
      currentInactivityCost,
      targetReductionRate,
      projectedSavings: Number((currentInactivityCost * targetReductionRate).toFixed(2)),
      currency: 'PEN',
      explanation: 'El ahorro proyectado estima cuánto podría reducirse el costo por inactividad si la obra disminuye en 20% las horas inactivas del periodo seleccionado.',
    };
  }

  calculateUsageHours(records: StateRecordLike[], startDate: Date, endDate: Date) {
    const activeHours = records
      .filter((record) => record.status === MachineStatus.ACTIVE)
      .reduce((total, record) => total + overlapInHours(record.startDate, record.endDate, startDate, endDate), 0);

    const inactiveHours = records
      .filter((record) => record.status === MachineStatus.INACTIVE)
      .reduce((total, record) => total + overlapInHours(record.startDate, record.endDate, startDate, endDate), 0);

    const totalClassifiedHours = activeHours + inactiveHours;
    const effectiveUsagePercentage =
      totalClassifiedHours === 0 ? 0 : (activeHours / totalClassifiedHours) * 100;

    return {
      activeHours,
      inactiveHours,
      totalClassifiedHours,
      effectiveUsagePercentage: totalClassifiedHours === 0 ? null : effectiveUsagePercentage,
    };
  }

  calculateInactivityCost(inactiveHours: number, hourlyRate: number) {
    return inactiveHours * hourlyRate;
  }

  async getUsageComparison(query: UsageComparisonQueryDto) {
    const startRange = this.getReportRange(query.from);
    const endRange = this.getReportRange(query.to);
    if (endRange.endDate <= startRange.startDate) {
      throw new BadRequestException('Usage comparison range is invalid');
    }
    const threshold = query.lowUtilizationThreshold ?? this.lowUtilizationThreshold;
    const machines = await this.prisma.machine.findMany({
      where: { siteId: query.siteId },
      include: { site: true },
    });
    const results = await Promise.all(
      machines.map(async (machine) => {
        const records = await this.prisma.machineStateRecord.findMany({
          where: {
            machineId: machine.id,
            startDate: { lt: endRange.endDate },
            OR: [{ endDate: null }, { endDate: { gt: startRange.startDate } }],
          },
        });
        const usage = this.calculateUsageHours(records, startRange.startDate, endRange.endDate);
        if (usage.totalClassifiedHours === 0 || usage.effectiveUsagePercentage === null) return null;
        const hourlyRate = Number(machine.hourlyRate);
        return {
          machineId: machine.id,
          machineCode: machine.code,
          machineType: machine.type,
          siteId: machine.siteId,
          siteName: machine.site.name,
          activeHours: Number(usage.activeHours.toFixed(2)),
          inactiveHours: Number(usage.inactiveHours.toFixed(2)),
          totalClassifiedHours: Number(usage.totalClassifiedHours.toFixed(2)),
          effectiveUsagePercentage: Number(usage.effectiveUsagePercentage.toFixed(2)),
          hourlyRate,
          inactivityCost: Number(this.calculateInactivityCost(usage.inactiveHours, hourlyRate).toFixed(2)),
          availableOperatingCost: Number((usage.totalClassifiedHours * hourlyRate).toFixed(2)),
          lowUtilization: usage.effectiveUsagePercentage < threshold,
        };
      }),
    );
    return {
      from: query.from,
      to: query.to,
      timeZone: this.workdayConfiguration.timeZone,
      lowUtilizationThreshold: threshold,
      machines: results.filter((result): result is NonNullable<typeof result> => result !== null)
        .sort((left, right) => left.effectiveUsagePercentage - right.effectiveUsagePercentage),
    };
  }

  async generateUsagePdf(machineId: number, query: UsageComparisonQueryDto): Promise<Buffer> {
    const comparison = await this.getUsageComparison(query);
    const machine = comparison.machines.find((item) => item.machineId === machineId);
    if (!machine) throw new NotFoundException('Machine has no classified usage in the selected range');
    const document = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    const completed = new Promise<Buffer>((resolve, reject) => {
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);
    });
    document.fontSize(20).text('WorkMeter - Reporte de uso efectivo');
    document.moveDown().fontSize(11);
    document.text(`Maquinaria: ${machine.machineCode} (${machine.machineType})`);
    document.text(`Obra: ${machine.siteName}`);
    document.text(`Periodo: ${query.from} a ${query.to}`);
    document.text(`Horas activas: ${machine.activeHours}`);
    document.text(`Horas inactivas: ${machine.inactiveHours}`);
    document.text(`Uso efectivo: ${machine.effectiveUsagePercentage}%`);
    document.text(`Tarifa: S/ ${machine.hourlyRate.toFixed(2)} por hora`);
    document.text(`Costo por inactividad: S/ ${machine.inactivityCost.toFixed(2)}`);
    document.text(`Generado: ${new Date().toISOString()}`);
    document.end();
    return completed;
  }

  getReportRange(date: string) {
    return getWorkdayRange(date, this.workdayConfiguration);
  }

  @Cron('0 * * * * *')
  async runAutomaticGeneration(now = new Date()) {
    const local = getLocalDateTime(now, this.workdayConfiguration.timeZone);
    if (local.time !== this.workdayConfiguration.endTime) {
      return [];
    }

    const crossesMidnight = this.workdayConfiguration.endTime <= this.workdayConfiguration.startTime;
    const reportDate = crossesMidnight ? previousCalendarDate(local.date) : local.date;
    const machines = await this.prisma.machine.findMany({ select: { id: true } });
    const generated: number[] = [];

    for (const machine of machines) {
      try {
        const report = await this.generateDailyReport({ machineId: machine.id, date: reportDate });
        generated.push(report.reportId);
      } catch (error) {
        this.logger.error(
          `Automatic daily report failed for machine ${machine.id} and date ${reportDate}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
    return generated;
  }

  private toDailyReportResponse(report: StoredReport, requestedDate?: string) {
    const inactivityCost = report.inactivityCosts[0];
    return {
      reportId: report.id,
      machineId: report.machineId,
      machineCode: report.machine.code,
      siteId: report.siteId,
      siteName: report.machine.site.name,
      date:
        requestedDate ??
        getLocalDateTime(report.startDate, this.workdayConfiguration.timeZone).date,
      periodStart: report.startDate.toISOString(),
      periodEnd: report.endDate.toISOString(),
      generatedAt: report.generatedAt.toISOString(),
      activeHours: Number(report.activeHours),
      inactiveHours: Number(report.inactiveHours),
      totalClassifiedHours: Number(report.totalClassifiedHours),
      effectiveUsagePercentage:
        report.effectiveUsagePercentage === null
          ? null
          : Number(report.effectiveUsagePercentage),
      hourlyRate: inactivityCost
        ? Number(inactivityCost.contractRate)
        : Number(report.machine.hourlyRate),
      inactivityCost: inactivityCost ? Number(inactivityCost.amount) : 0,
      hasData: Number(report.totalClassifiedHours) > 0,
    };
  }
}
