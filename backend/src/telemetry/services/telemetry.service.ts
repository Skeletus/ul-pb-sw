import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MonitoringService } from '../../monitoring/services/monitoring.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTelemetryDto } from '../dto/create-telemetry.dto';

@Injectable()
export class TelemetryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoringService: MonitoringService,
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

    const reading = await this.prisma.sensorReading.create({
      data: {
        machineId: createTelemetryDto.machineId,
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
}
