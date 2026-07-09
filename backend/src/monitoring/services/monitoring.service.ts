import { Injectable } from '@nestjs/common';
import { MachineStatus, SensorReading } from '@prisma/client';
import { AlertsService } from '../../alerts/services/alerts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsageClassifier } from './usage-classifier.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageClassifier: UsageClassifier,
    private readonly alertsService: AlertsService,
  ) {}

  async processReading(machineId: number, reading: SensorReading) {
    const machine = await this.prisma.machine.findUniqueOrThrow({
      where: { id: machineId },
    });

    const recentReadings = await this.prisma.sensorReading.findMany({
      where: { machineId },
      orderBy: { timestamp: 'asc' },
      take: 200,
    });

    const classification = this.usageClassifier.classify(
      recentReadings.map((item) => ({
        timestamp: item.timestamp,
        vibration: item.vibration.toNumber(),
        energyConsumption: item.energyConsumption.toNumber(),
      })),
      machine.currentStatus,
    );

    if (
      classification.status === MachineStatus.ACTIVE ||
      (classification.status === MachineStatus.INACTIVE && classification.inactiveSince)
    ) {
      await this.updateMachineState(
        machineId,
        classification.status,
        classification.status === MachineStatus.INACTIVE && classification.inactiveSince
          ? classification.inactiveSince
          : reading.timestamp,
      );
    }

    if (classification.status === MachineStatus.ACTIVE) {
      await this.alertsService.resolveActiveForMachine(machineId, reading.timestamp);
    }

    if (classification.status === MachineStatus.INACTIVE && classification.inactiveSince) {
      await this.alertsService.evaluateInactivity(machineId, classification.inactiveSince, reading.timestamp);
    }

    return this.prisma.machine.findUnique({
      where: { id: machineId },
      include: {
        machineStateRecords: {
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });
  }

  private async updateMachineState(machineId: number, status: MachineStatus, startDate: Date) {
    const openState = await this.prisma.machineStateRecord.findFirst({
      where: { machineId, endDate: null },
      orderBy: { startDate: 'desc' },
    });

    if (openState?.status === status) {
      await this.prisma.machine.update({
        where: { id: machineId },
        data: { currentStatus: status },
      });
      return openState;
    }

    if (openState) {
      await this.prisma.machineStateRecord.update({
        where: { id: openState.id },
        data: { endDate: startDate },
      });
    }

    const newState = await this.prisma.machineStateRecord.create({
      data: {
        machineId,
        status,
        startDate,
      },
    });

    await this.prisma.machine.update({
      where: { id: machineId },
      data: { currentStatus: status },
    });

    return newState;
  }
}
