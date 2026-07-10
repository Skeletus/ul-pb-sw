import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    const reports = await this.prisma.report.findMany({
      where: {
        type: 'DAILY',
        machineId: query.machineId,
        startDate: range?.startDate,
        endDate: range?.endDate,
      },
      include: {
        machine: { include: { site: true } },
        inactivityCosts: true,
      },
      orderBy: [{ startDate: 'desc' }, { machineId: 'asc' }],
    });
    return reports.map((item) => this.toDailyReportResponse(item));
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
