import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertConfigurationDto } from '../dto/alert-configuration.dto';

const DEFAULT_THRESHOLD_MINUTES = 30;

@Injectable()
export class AlertConfigurationService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  private fallbackThreshold() {
    const configured = Number(this.config.get('ALERT_THRESHOLD_MINUTES'));
    return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_THRESHOLD_MINUTES;
  }

  async get(machineId: number) {
    await this.ensureMachine(machineId);
    const configuration = await this.prisma.alertConfiguration.findUnique({ where: { machineId } });
    if (configuration) return { ...configuration, customized: true };
    return { machineId, inactivityThresholdMinutes: this.fallbackThreshold(), active: true, customized: false };
  }

  async upsert(machineId: number, dto: AlertConfigurationDto) {
    await this.ensureMachine(machineId);
    return this.prisma.alertConfiguration.upsert({
      where: { machineId },
      update: { inactivityThresholdMinutes: dto.inactivityThresholdMinutes, active: dto.active ?? true },
      create: { machineId, inactivityThresholdMinutes: dto.inactivityThresholdMinutes, active: dto.active ?? true },
    });
  }

  private async ensureMachine(machineId: number) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId }, select: { id: true } });
    if (!machine) throw new NotFoundException('Machine not found');
  }
}
