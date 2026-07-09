import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AlertsService } from '../services/alerts.service';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('active')
  @ApiOkResponse({ description: 'Active alerts' })
  findActive() {
    return this.alertsService.findActive();
  }

  @Get()
  @ApiOkResponse({ description: 'All alerts' })
  findAll() {
    return this.alertsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Alert detail' })
  @ApiNotFoundResponse({ description: 'Alert not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }
}
