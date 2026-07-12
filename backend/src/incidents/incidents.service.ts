import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { AuditAction } from '@prisma/client';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  async create(alertId: number, registeredById: number, dto: CreateIncidentDto) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
      include: { machine: true },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    const incident = await this.prisma.operationalIncident.create({
      data: {
        alertId,
        machineId: alert.machineId,
        siteId: alert.machine.siteId,
        registeredById,
        ...dto,
      },
      include: { registeredBy: { select: { id: true, name: true, email: true } } },
    });
    await this.audit.record({ userId: registeredById, action: AuditAction.INCIDENT_CREATED, resource: 'OperationalIncident', resourceId: incident.id, metadata: { alertId, severity: dto.severity } });
    return incident;
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
