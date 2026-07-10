import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContractStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalContractDto } from './dto/create-rental-contract.dto';
import { UpdateRentalContractDto } from './dto/update-rental-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(machineId: number, dto: CreateRentalContractDto) {
    await this.requireMachine(machineId);
    const existing = await this.prisma.rentalContract.findFirst({
      where: { machineId, status: ContractStatus.VALID },
    });
    if (existing) {
      throw new ConflictException('Machine already has a valid rental contract');
    }
    const dates = this.validateDates(dto.startDate, dto.endDate);
    return this.prisma.$transaction(async (transaction) => {
      const contract = await transaction.rentalContract.create({
        data: { machineId, ...dates, totalCost: dto.totalCost, hourlyRate: dto.hourlyRate },
      });
      await transaction.machine.update({ where: { id: machineId }, data: { hourlyRate: dto.hourlyRate } });
      return contract;
    });
  }

  async findByMachine(machineId: number) {
    await this.requireMachine(machineId);
    return this.prisma.rentalContract.findMany({
      where: { machineId },
      orderBy: { startDate: 'desc' },
    });
  }

  async update(id: number, dto: UpdateRentalContractDto) {
    const contract = await this.prisma.rentalContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Rental contract not found');
    const startDate = dto.startDate ?? contract.startDate.toISOString().slice(0, 10);
    const endDate = dto.endDate ?? contract.endDate.toISOString().slice(0, 10);
    const dates = this.validateDates(startDate, endDate);
    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.rentalContract.update({
        where: { id },
        data: { ...dates, totalCost: dto.totalCost, hourlyRate: dto.hourlyRate, status: dto.status },
      });
      if (dto.hourlyRate !== undefined && updated.status === ContractStatus.VALID) {
        await transaction.machine.update({ where: { id: updated.machineId }, data: { hourlyRate: dto.hourlyRate } });
      }
      return updated;
    });
  }

  private validateDates(startValue: string, endValue: string) {
    const startDate = new Date(`${startValue.slice(0, 10)}T00:00:00.000Z`);
    const endDate = new Date(`${endValue.slice(0, 10)}T00:00:00.000Z`);
    if (endDate < startDate) throw new BadRequestException('Contract end date must not precede start date');
    return { startDate, endDate, durationDays: Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1 };
  }

  private async requireMachine(machineId: number) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new NotFoundException('Machine not found');
    return machine;
  }
}
