import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, MachineStatus } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from '../dto/create-machine.dto';

@Injectable()
export class MachineryService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  async create(createMachineDto: CreateMachineDto, userId?: number) {
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

    const machine = await this.prisma.machine.create({
      data: {
        siteId: createMachineDto.siteId,
        code: createMachineDto.code,
        type: createMachineDto.type,
        hourlyRate: createMachineDto.hourlyRate ?? 0,
      },
    });
    await this.audit.record({ userId, action: AuditAction.CREATE, resource: 'Machine', resourceId: machine.id, metadata: { code: machine.code } });
    return machine;
  }

  findAll(siteId?: number) {
    return this.prisma.machine.findMany({
      where: siteId ? { siteId } : undefined,
      orderBy: { id: 'asc' },
      include: { site: true },
    });
  }

  sites() { return this.prisma.site.findMany({ orderBy: { name: 'asc' } }); }
  async update(id:number,dto:{code?:string;type?:string;siteId?:number}, userId?: number) { if(dto.code){const duplicate=await this.prisma.machine.findUnique({where:{code:dto.code}});if(duplicate&&duplicate.id!==id)throw new ConflictException('Machine code already exists');} const machine = await this.prisma.machine.update({where:{id},data:dto,include:{site:true}}); await this.audit.record({ userId, action: AuditAction.UPDATE, resource: 'Machine', resourceId: id, metadata: { fields: Object.keys(dto) } }); return machine; }
  async decommission(id:number, userId?: number){const machine=await this.prisma.$transaction(async tx=>{const item=await tx.machine.update({where:{id},data:{currentStatus:MachineStatus.DECOMMISSIONED}});await tx.machineStateRecord.updateMany({where:{machineId:id,endDate:null},data:{endDate:new Date()}});return item;}); await this.audit.record({ userId, action: AuditAction.DELETE, resource: 'Machine', resourceId: id, metadata: { softDelete: true } }); return machine;}

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
