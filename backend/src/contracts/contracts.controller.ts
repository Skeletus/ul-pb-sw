import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContractsService } from './contracts.service';
import { CreateRentalContractDto } from './dto/create-rental-contract.dto';
import { UpdateRentalContractDto } from './dto/update-rental-contract.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('machines/:machineId/contracts')
  create(@Param('machineId', ParseIntPipe) machineId: number, @Body() dto: CreateRentalContractDto) {
    return this.contractsService.create(machineId, dto);
  }

  @Get('machines/:machineId/contracts')
  findByMachine(@Param('machineId', ParseIntPipe) machineId: number) {
    return this.contractsService.findByMachine(machineId);
  }

  @Patch('contracts/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRentalContractDto) {
    return this.contractsService.update(id, dto);
  }
}
