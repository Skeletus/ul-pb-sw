import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/maintenance.dto';
type AuthRequest = Request & { user: { id: number } };
@Controller() @UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}
  @Post('machines/:machineId/maintenance') create(@Param('machineId', ParseIntPipe) machineId: number, @Req() req: AuthRequest, @Body() dto: CreateMaintenanceDto) { return this.service.create(machineId, req.user.id, dto); }
  @Get('machines/:machineId/maintenance') findByMachine(@Param('machineId', ParseIntPipe) machineId: number) { return this.service.findByMachine(machineId); }
  @Get('maintenance/:id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch('maintenance/:id') @UseGuards(RolesGuard) @Roles('ADMINISTRATOR') update(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest, @Body() dto: UpdateMaintenanceDto) { return this.service.update(id, req.user.id, dto); }
  @Delete('maintenance/:id') @UseGuards(RolesGuard) @Roles('ADMINISTRATOR') remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) { return this.service.remove(id, req.user.id); }
}
