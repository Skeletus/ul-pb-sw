import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertStatus, MachineStatus, Prisma } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { minutesBetween } from '../../common/utils/time.util';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { AlertRealtimeEvent } from '../../realtime/types/realtime-event.types';

export const DEFAULT_ALERT_THRESHOLD_MINUTES = 30;

type DatabaseClient = Prisma.TransactionClient | PrismaService;
type AlertWithContext = Prisma.AlertGetPayload<{
  include: { machine: { include: { site: true } }; stateRecord: true };
}>;

export type AlertEvaluation = {
  alert: AlertWithContext | null;
  created: boolean;
};

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private readonly alertThresholdMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    configService?: ConfigService,
  ) {
    this.alertThresholdMinutes = Number(
      configService?.get('ALERT_THRESHOLD_MINUTES') ?? DEFAULT_ALERT_THRESHOLD_MINUTES,
    );
  }

  async evaluateInactivity(
    machineId: number,
    stateRecordId: number,
    inactiveSince: Date,
    evaluatedAt: Date,
    client: DatabaseClient = this.prisma,
  ): Promise<AlertEvaluation> {
    if (minutesBetween(inactiveSince, evaluatedAt) <= this.alertThresholdMinutes) {
      return { alert: null, created: false };
    }

    const existing = await client.alert.findFirst({
      where: {
        OR: [
          { stateRecordId },
          { machineId, status: AlertStatus.ACTIVE },
        ],
      },
      include: { machine: { include: { site: true } }, stateRecord: true },
      orderBy: { generationDate: 'desc' },
    });
    if (existing) {
      return { alert: existing, created: false };
    }

    try {
      const alert = await client.alert.create({
        data: {
          machineId,
          stateRecordId,
          priority: 'HIGH',
          status: AlertStatus.ACTIVE,
          generationDate: evaluatedAt,
        },
        include: { machine: { include: { site: true } }, stateRecord: true },
      });
      return { alert, created: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const alert = await client.alert.findUnique({
          where: { stateRecordId },
          include: { machine: { include: { site: true } }, stateRecord: true },
        });
        return { alert, created: false };
      }
      throw error;
    }
  }

  async resolveActiveForMachine(
    machineId: number,
    resolvedAt: Date,
    client: DatabaseClient = this.prisma,
  ): Promise<AlertWithContext[]> {
    const activeAlerts = await client.alert.findMany({
      where: { machineId, status: AlertStatus.ACTIVE },
      include: { machine: { include: { site: true } }, stateRecord: true },
    });
    if (activeAlerts.length === 0) {
      return [];
    }

    await client.alert.updateMany({
      where: { id: { in: activeAlerts.map((alert) => alert.id) } },
      data: { status: AlertStatus.RESOLVED, resolvedDate: resolvedAt },
    });

    return activeAlerts.map((alert) => ({
      ...alert,
      status: AlertStatus.RESOLVED,
      resolvedDate: resolvedAt,
    }));
  }

  publishCreated(alert: AlertWithContext, evaluatedAt: Date) {
    this.realtimeGateway.emitAlertCreated(this.toRealtimeEvent(alert, evaluatedAt));
  }

  publishResolved(alert: AlertWithContext) {
    this.realtimeGateway.emitAlertResolved(
      this.toRealtimeEvent(alert, alert.resolvedDate ?? new Date()),
    );
  }

  @Cron('0 * * * * *')
  async evaluateOpenInactivityPeriods(now = new Date()) {
    try {
      const cutoff = new Date(now.getTime() - this.alertThresholdMinutes * 60000);
      const openPeriods = await this.prisma.machineStateRecord.findMany({
        where: {
          status: MachineStatus.INACTIVE,
          endDate: null,
          startDate: { lt: cutoff },
        },
      });

      for (const period of openPeriods) {
        try {
          const evaluation = await this.evaluateInactivity(
            period.machineId,
            period.id,
            period.startDate,
            now,
          );
          if (evaluation.created && evaluation.alert) {
            this.publishCreated(evaluation.alert, now);
          }
        } catch (error) {
          this.logger.error(
            `Failed to evaluate inactivity alert for machine ${period.machineId}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to scan open inactivity periods',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async findActive() {
    const alerts = await this.prisma.alert.findMany({
      where: { status: AlertStatus.ACTIVE },
      include: { machine: { include: { site: true } }, stateRecord: true },
      orderBy: { generationDate: 'desc' },
    });
    return alerts.map((alert) => this.toResponse(alert));
  }

  async findAll() {
    const alerts = await this.prisma.alert.findMany({
      include: { machine: { include: { site: true } }, stateRecord: true },
      orderBy: { generationDate: 'desc' },
    });
    return alerts.map((alert) => this.toResponse(alert));
  }

  async findOne(id: number) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: { machine: { include: { site: true } }, stateRecord: true },
    });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return this.toResponse(alert);
  }

  private toResponse(alert: AlertWithContext) {
    const inactiveSince = alert.stateRecord?.startDate ?? alert.generationDate;
    const durationEnd = alert.resolvedDate ?? new Date();
    return {
      ...alert,
      inactiveSince,
      inactiveDurationMinutes: Number(minutesBetween(inactiveSince, durationEnd).toFixed(2)),
    };
  }

  private toRealtimeEvent(alert: AlertWithContext, durationEnd: Date): AlertRealtimeEvent {
    const inactiveSince = alert.stateRecord?.startDate ?? alert.generationDate;
    return {
      alertId: alert.id,
      machineId: alert.machineId,
      machineCode: alert.machine.code,
      siteId: alert.machine.siteId,
      siteName: alert.machine.site.name,
      priority: alert.priority,
      status: alert.status,
      generationDate: alert.generationDate.toISOString(),
      resolvedDate: alert.resolvedDate?.toISOString() ?? null,
      inactiveSince: inactiveSince.toISOString(),
      inactiveDurationMinutes: Number(minutesBetween(inactiveSince, durationEnd).toFixed(2)),
    };
  }
}
