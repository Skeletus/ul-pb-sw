import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SensorStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSensorDto } from './dto/create-sensor.dto';

@Injectable()
export class SensorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSensorDto) {
    return this.prisma.sensor.create({ data: dto });
  }

  async associate(machineId: number, identifier: string) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId }, include: { sensors: true } });
    if (!machine) throw new NotFoundException('Machine not found');
    if (machine.sensors.some((sensor) => sensor.status === SensorStatus.ACTIVE || sensor.status === SensorStatus.ASSOCIATED)) {
      throw new ConflictException('Machine already has an active sensor');
    }
    const sensor = await this.prisma.sensor.findUnique({ where: { identifier } });
    if (!sensor) throw new NotFoundException('Sensor not found');
    if (sensor.machineId || sensor.status !== SensorStatus.AVAILABLE) {
      throw new ConflictException('Sensor is not available');
    }
    return this.prisma.sensor.update({
      where: { id: sensor.id },
      data: { machineId, status: SensorStatus.ACTIVE, installedAt: new Date(), lastConnectionAt: new Date() },
    });
  }

  async findByMachine(machineId: number) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new NotFoundException('Machine not found');
    return this.prisma.sensor.findFirst({ where: { machineId }, orderBy: { installedAt: 'desc' } });
  }
}
