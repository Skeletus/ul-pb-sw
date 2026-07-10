import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(alertId: number, registeredById: number, dto: CreateIncidentDto) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
      include: { machine: true },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    return this.prisma.operationalIncident.create({
      data: {
        alertId,
        machineId: alert.machineId,
        siteId: alert.machine.siteId,
        registeredById,
        ...dto,
      },
      include: { registeredBy: { select: { id: true, name: true, email: true } } },
    });
  }

  findByAlert(alertId: number) {
    return this.prisma.operationalIncident.findMany({
      where: { alertId },
      include: { registeredBy: { select: { id: true, name: true, email: true } } },
      orderBy: { registrationDate: 'desc' },
    });
  }

  findByMachine(machineId: number) {
    return this.prisma.operationalIncident.findMany({
      where: { machineId },
      include: { registeredBy: { select: { id: true, name: true, email: true } } },
      orderBy: { registrationDate: 'desc' },
    });
  }
}
