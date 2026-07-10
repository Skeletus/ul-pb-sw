import { Injectable } from '@nestjs/common';
import { MachineStatus, SensorReading } from '@prisma/client';
import { AlertsService } from '../../alerts/services/alerts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { UsageClassifier } from './usage-classifier.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageClassifier: UsageClassifier,
    private readonly alertsService: AlertsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async processReading(machineId: number, reading: SensorReading) {
    const machine = await this.prisma.machine.findUniqueOrThrow({
      where: { id: machineId },
    });
    const recentReadings = await this.prisma.sensorReading.findMany({
      where: { machineId },
      orderBy: { timestamp: 'desc' },
    });
    const classification = this.usageClassifier.classify(
      recentReadings.map((item) => ({
        timestamp: item.timestamp,
        vibration: item.vibration.toNumber(),
        energyConsumption: item.energyConsumption.toNumber(),
      })),
      machine.currentStatus,
    );

    const result = await this.prisma.$transaction(async (transaction) => {
      const openState = await transaction.machineStateRecord.findFirst({
        where: { machineId, endDate: null },
        orderBy: { startDate: 'desc' },
      });
      const classifiable =
        classification.status === MachineStatus.ACTIVE ||
        classification.status === MachineStatus.INACTIVE;
      let currentState = openState;
      let stateChanged = false;

      if (classifiable && openState?.status !== classification.status) {
        const effectiveAt = classification.transitionAt ?? reading.timestamp;
        if (openState) {
          await transaction.machineStateRecord.update({
            where: { id: openState.id },
            data: { endDate: effectiveAt },
          });
        }
        currentState = await transaction.machineStateRecord.create({
          data: { machineId, status: classification.status, startDate: effectiveAt },
        });
        stateChanged = true;
      }

      if (classifiable) {
        await transaction.machine.update({
          where: { id: machineId },
          data: { currentStatus: classification.status },
        });
      }

      const resolvedAlerts =
        classification.status === MachineStatus.ACTIVE
          ? await this.alertsService.resolveActiveForMachine(
              machineId,
              classification.transitionAt ?? reading.timestamp,
              transaction,
            )
          : [];
      const alertEvaluation =
        classification.status === MachineStatus.INACTIVE && currentState
          ? await this.alertsService.evaluateInactivity(
              machineId,
              currentState.id,
              currentState.startDate,
              reading.timestamp,
              transaction,
            )
          : { alert: null, created: false };

      const updatedMachine = await transaction.machine.findUniqueOrThrow({
        where: { id: machineId },
        include: {
          site: true,
          machineStateRecords: {
            orderBy: { startDate: 'desc' },
            take: 1,
          },
        },
      });

      return { updatedMachine, currentState, stateChanged, resolvedAlerts, alertEvaluation };
    });

    if (result.stateChanged && result.currentState) {
      this.realtimeGateway.emitMachineStatusChanged({
        machineId,
        machineCode: result.updatedMachine.code,
        siteId: result.updatedMachine.siteId,
        status: result.currentState.status,
        effectiveAt: result.currentState.startDate.toISOString(),
        stateRecordId: result.currentState.id,
      });
    }
    for (const alert of result.resolvedAlerts) {
      this.alertsService.publishResolved(alert);
    }
    if (result.alertEvaluation.created && result.alertEvaluation.alert) {
      this.alertsService.publishCreated(result.alertEvaluation.alert, reading.timestamp);
    }

    return result.updatedMachine;
  }
}
