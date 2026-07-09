import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertStatus } from '@prisma/client';
import { minutesBetween } from '../../common/utils/time.util';
import { PrismaService } from '../../prisma/prisma.service';

export const DEFAULT_ALERT_THRESHOLD_MINUTES = 30;

@Injectable()
export class AlertsService {
  private readonly alertThresholdMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    configService?: ConfigService,
  ) {
    this.alertThresholdMinutes = Number(
      configService?.get('ALERT_THRESHOLD_MINUTES') ?? DEFAULT_ALERT_THRESHOLD_MINUTES,
    );
  }

  async evaluateInactivity(machineId: number, inactiveSince: Date, evaluatedAt: Date) {
    const inactiveMinutes = minutesBetween(inactiveSince, evaluatedAt);
    if (inactiveMinutes <= this.alertThresholdMinutes) {
      return null;
    }

    const activeAlert = await this.prisma.alert.findFirst({
      where: {
        machineId,
        status: AlertStatus.ACTIVE,
      },
      orderBy: { generationDate: 'desc' },
    });

    if (activeAlert) {
      return activeAlert;
    }

    return this.prisma.alert.create({
      data: {
        machineId,
        priority: 'HIGH',
        status: AlertStatus.ACTIVE,
        generationDate: evaluatedAt,
      },
    });
  }

  async resolveActiveForMachine(machineId: number, resolvedAt: Date) {
    await this.prisma.alert.updateMany({
      where: { machineId, status: AlertStatus.ACTIVE },
      data: { status: AlertStatus.RESOLVED, resolvedDate: resolvedAt },
    });
  }

  findActive() {
    return this.prisma.alert.findMany({
      where: { status: AlertStatus.ACTIVE },
      include: { machine: true },
      orderBy: { generationDate: 'desc' },
    });
  }

  findAll() {
    return this.prisma.alert.findMany({
      include: { machine: true },
      orderBy: { generationDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: { machine: true },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }
}
