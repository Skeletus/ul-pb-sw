import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AssociateSensorDto } from './dto/associate-sensor.dto';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { SensorsService } from './sensors.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Post('sensors')
  create(@Body() dto: CreateSensorDto) {
    return this.sensorsService.create(dto);
  }

  @Post('machines/:machineId/sensor')
  associate(@Param('machineId', ParseIntPipe) machineId: number, @Body() dto: AssociateSensorDto) {
    return this.sensorsService.associate(machineId, dto.identifier);
  }

  @Get('machines/:machineId/sensor')
  findByMachine(@Param('machineId', ParseIntPipe) machineId: number) {
    return this.sensorsService.findByMachine(machineId);
  }
}
