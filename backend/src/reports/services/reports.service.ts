import { Injectable, NotFoundException } from '@nestjs/common';
import { MachineStatus, Prisma } from '@prisma/client';
import { overlapInHours } from '../../common/utils/time.util';
import { PrismaService } from '../../prisma/prisma.service';
import { DailyReportQueryDto } from '../dto/daily-report-query.dto';

type StateRecordLike = {
  status: MachineStatus;
  startDate: Date;
  endDate: Date | null;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateDailyReport(query: DailyReportQueryDto) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: query.machineId },
      include: { site: true },
    });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const { startDate, endDate } = this.getDayRange(query.date);
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

    const report = await this.prisma.report.upsert({
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
      },
      create: {
        siteId: machine.siteId,
        machineId: machine.id,
        type: 'DAILY',
        startDate,
        endDate,
      },
    });

    await this.prisma.inactivityCost.upsert({
      where: {
        reportId_machineId: {
          reportId: report.id,
          machineId: machine.id,
        },
      },
      update: {
        inactiveHours: new Prisma.Decimal(usage.inactiveHours.toFixed(2)),
        contractRate: new Prisma.Decimal(contractRate.toFixed(2)),
        amount: new Prisma.Decimal(inactivityCostAmount.toFixed(2)),
      },
      create: {
        reportId: report.id,
        machineId: machine.id,
        inactiveHours: new Prisma.Decimal(usage.inactiveHours.toFixed(2)),
        contractRate: new Prisma.Decimal(contractRate.toFixed(2)),
        amount: new Prisma.Decimal(inactivityCostAmount.toFixed(2)),
      },
    });

    return {
      reportId: report.id,
      machineId: machine.id,
      machineCode: machine.code,
      siteId: machine.siteId,
      date: query.date,
      activeHours: Number(usage.activeHours.toFixed(2)),
      inactiveHours: Number(usage.inactiveHours.toFixed(2)),
      effectiveUsagePercentage: Number(usage.effectiveUsagePercentage.toFixed(2)),
      hourlyRate: contractRate,
      inactivityCost: Number(inactivityCostAmount.toFixed(2)),
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
      effectiveUsagePercentage,
    };
  }

  calculateInactivityCost(inactiveHours: number, hourlyRate: number) {
    return inactiveHours * hourlyRate;
  }

  private getDayRange(date: string) {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);
    return { startDate, endDate };
  }
}
