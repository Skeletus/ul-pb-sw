import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SensorStatus } from '@prisma/client';
import { MonitoringService } from '../../monitoring/services/monitoring.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTelemetryDto } from '../dto/create-telemetry.dto';
import { EnergyConsumptionQueryDto } from '../dto/energy-consumption-query.dto';

@Injectable()
export class TelemetryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoringService: MonitoringService,
    private readonly configService: ConfigService,
  ) {}

  async create(createTelemetryDto: CreateTelemetryDto) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: createTelemetryDto.machineId },
    });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const timestamp = createTelemetryDto.timestamp ? new Date(createTelemetryDto.timestamp) : new Date();
    const latestReading = await this.prisma.sensorReading.findFirst({
      where: { machineId: createTelemetryDto.machineId },
      orderBy: { timestamp: 'desc' },
    });
    if (latestReading && timestamp <= latestReading.timestamp) {
      throw new BadRequestException(
        'Telemetry timestamp must be later than the latest accepted reading',
      );
    }

    const sensor = await this.prisma.sensor.findFirst({
      where: { machineId: createTelemetryDto.machineId, status: SensorStatus.ACTIVE },
    });
    const reading = await this.prisma.sensorReading.create({
      data: {
        machineId: createTelemetryDto.machineId,
        sensorId: sensor?.id,
        vibration: createTelemetryDto.vibrationValue,
        energyConsumption: createTelemetryDto.energyConsumption,
        timestamp,
      },
    });

    const machineState = await this.monitoringService.processReading(createTelemetryDto.machineId, reading);

    return {
      reading,
      machineState,
    };
  }

  async findByMachine(machineId: number) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    return this.prisma.sensorReading.findMany({
      where: { machineId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async getEnergyConsumption(machineId: number, query: EnergyConsumptionQueryDto) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new NotFoundException('Machine not found');
    const sensor = await this.prisma.sensor.findFirst({
      where: { machineId, status: SensorStatus.ACTIVE },
    });
    if (!sensor) throw new NotFoundException('Active energy sensor not found for machine');
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (to <= from) throw new BadRequestException('Energy consumption range end must be after start');
    const readings = await this.prisma.sensorReading.findMany({
      where: {
        machineId,
        timestamp: { gte: from, lte: to },
        OR: [{ sensorId: sensor.id }, { sensorId: null }],
      },
      orderBy: { timestamp: 'asc' },
    });
    const values = readings.map((reading) => Number(reading.energyConsumption));
    const totalConsumption = values.reduce((total, value) => total + value, 0);
    const timeZone = this.configService.get<string>('WORK_TIMEZONE') ?? 'America/Lima';
    return {
      machineId,
      sensorId: sensor.id,
      from: from.toISOString(),
      to: to.toISOString(),
      timeZone,
      interval: query.interval ?? null,
      totalConsumption: Number(totalConsumption.toFixed(4)),
      averageConsumption: values.length ? Number((totalConsumption / values.length).toFixed(4)) : null,
      minimumConsumption: values.length ? Math.min(...values) : null,
      maximumConsumption: values.length ? Math.max(...values) : null,
      readingCount: values.length,
    };
  }
}
