import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentsService } from './incidents.service';

type AuthenticatedRequest = Request & { user: { id: number } };

@UseGuards(JwtAuthGuard)
@Controller()
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post('alerts/:alertId/incidents')
  create(
    @Param('alertId', ParseIntPipe) alertId: number,
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(alertId, request.user.id, dto);
  }

  @Get('alerts/:alertId/incidents')
  findByAlert(@Param('alertId', ParseIntPipe) alertId: number) {
    return this.incidentsService.findByAlert(alertId);
  }

  @Get('machines/:machineId/incidents')
  findByMachine(@Param('machineId', ParseIntPipe) machineId: number) {
    return this.incidentsService.findByMachine(machineId);
  }
}
