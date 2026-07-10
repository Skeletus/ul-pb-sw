import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AlertConfigurationDto } from '../dto/alert-configuration.dto';
import { AlertConfigurationService } from '../services/alert-configuration.service';

@ApiTags('Alert configurations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('machines/:machineId/alert-configuration')
export class AlertConfigurationController {
  constructor(private readonly service: AlertConfigurationService) {}

  @Get()
  get(@Param('machineId', ParseIntPipe) machineId: number) { return this.service.get(machineId); }

  @Put()
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  update(@Param('machineId', ParseIntPipe) machineId: number, @Body() dto: AlertConfigurationDto) {
    return this.service.upsert(machineId, dto);
  }
}
