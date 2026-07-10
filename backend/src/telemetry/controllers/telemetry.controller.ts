import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTelemetryDto } from '../dto/create-telemetry.dto';
import { TelemetryService } from '../services/telemetry.service';
import { EnergyConsumptionQueryDto } from '../dto/energy-consumption-query.dto';

@ApiTags('Telemetry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Telemetry reading stored and processed' })
  @ApiNotFoundResponse({ description: 'Machine not found' })
  create(@Body() createTelemetryDto: CreateTelemetryDto) {
    return this.telemetryService.create(createTelemetryDto);
  }

  @Get('machine/:machineId')
  @ApiOkResponse({ description: 'Telemetry readings by machine' })
  @ApiNotFoundResponse({ description: 'Machine not found' })
  findByMachine(@Param('machineId', ParseIntPipe) machineId: number) {
    return this.telemetryService.findByMachine(machineId);
  }

  @Get('machine/:machineId/energy')
  getEnergyConsumption(
    @Param('machineId', ParseIntPipe) machineId: number,
    @Query() query: EnergyConsumptionQueryDto,
  ) {
    return this.telemetryService.getEnergyConsumption(machineId, query);
  }
}
