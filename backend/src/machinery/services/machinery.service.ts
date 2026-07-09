import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from '../dto/create-machine.dto';

@Injectable()
export class MachineryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMachineDto: CreateMachineDto) {
    const site = await this.prisma.site.findUnique({ where: { id: createMachineDto.siteId } });
    if (!site) {
      throw new NotFoundException('Site not found');
    }

    const existing = await this.prisma.machine.findUnique({
      where: { code: createMachineDto.code },
    });
    if (existing) {
      throw new ConflictException('Machine code already exists');
    }

    return this.prisma.machine.create({
      data: {
        siteId: createMachineDto.siteId,
        code: createMachineDto.code,
        type: createMachineDto.type,
        hourlyRate: createMachineDto.hourlyRate ?? 0,
      },
    });
  }

  findAll() {
    return this.prisma.machine.findMany({
      orderBy: { id: 'asc' },
      include: { site: true },
    });
  }

  async findOne(id: number) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    return machine;
  }

  async getStatus(id: number) {
    const machine = await this.prisma.machine.findUnique({ where: { id } });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const latestState = await this.prisma.machineStateRecord.findFirst({
      where: { machineId: id },
      orderBy: { startDate: 'desc' },
    });

    return {
      machineId: machine.id,
      code: machine.code,
      currentStatus: machine.currentStatus,
      lastStateStartDate: latestState?.startDate ?? null,
    };
  }
}
