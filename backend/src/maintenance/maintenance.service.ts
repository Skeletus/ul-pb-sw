import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, MachineStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}
  private validate(dto: CreateMaintenanceDto) {
    const date = new Date(dto.maintenanceDate);
    const next = dto.nextMaintenanceDate ? new Date(dto.nextMaintenanceDate) : undefined;
    if (next && next <= date) throw new BadRequestException('Next maintenance date must be after maintenance date');
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Maintenance date is invalid');
    return { maintenanceDate: date, nextMaintenanceDate: next };
  }
  async create(machineId: number, userId: number, dto: CreateMaintenanceDto) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new NotFoundException('Machine not found');
    const dates = this.validate(dto);
    const record = await this.prisma.$transaction(async tx => {
      const created = await tx.maintenanceRecord.create({ data: { machineId, siteId: machine.siteId, registeredById: userId, ...dto, ...dates, cost: dto.cost } });
      if (dto.status.toUpperCase() === 'IN_PROGRESS') await tx.machine.update({ where: { id: machineId }, data: { currentStatus: MachineStatus.UNDER_DOCUMENTED_MAINTENANCE } });
      return created;
    });
    await this.audit.record({ userId, action: AuditAction.MAINTENANCE_CREATED, resource: 'MaintenanceRecord', resourceId: record.id, metadata: { machineId, type: dto.type } });
    return record;
  }
  async findByMachine(machineId: number) {
    if (!await this.prisma.machine.findUnique({ where: { id: machineId }, select: { id: true } })) throw new NotFoundException('Machine not found');
    return this.prisma.maintenanceRecord.findMany({ where: { machineId }, include: { registeredBy: { select: { id: true, name: true } } }, orderBy: { maintenanceDate: 'desc' } });
  }
  async findOne(id: number) { const item = await this.prisma.maintenanceRecord.findUnique({ where: { id }, include: { registeredBy: { select: { id: true, name: true } }, machine: true } }); if (!item) throw new NotFoundException('Maintenance record not found'); return item; }
  async update(id: number, userId: number, dto: UpdateMaintenanceDto) { const old = await this.findOne(id); const dates = this.validate(dto); const item = await this.prisma.maintenanceRecord.update({ where: { id }, data: { ...dto, ...dates } }); await this.audit.record({ userId, action: AuditAction.MAINTENANCE_UPDATED, resource: 'MaintenanceRecord', resourceId: id, metadata: { machineId: old.machineId } }); return item; }
  async remove(id: number, userId: number) { const old = await this.findOne(id); const item = await this.prisma.maintenanceRecord.update({ where: { id }, data: { status: 'CANCELLED' } }); await this.audit.record({ userId, action: AuditAction.MAINTENANCE_DELETED, resource: 'MaintenanceRecord', resourceId: id, metadata: { machineId: old.machineId, softDelete: true } }); return item; }
}
