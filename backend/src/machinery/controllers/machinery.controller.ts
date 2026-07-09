import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMachineDto } from '../dto/create-machine.dto';
import { MachineResponseDto } from '../dto/machine-response.dto';
import { MachineStatusResponseDto } from '../dto/machine-status-response.dto';
import { MachineryService } from '../services/machinery.service';

@ApiTags('Machinery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('machines')
export class MachineryController {
  constructor(private readonly machineryService: MachineryService) {}

  @Post()
  @ApiCreatedResponse({ type: MachineResponseDto })
  @ApiNotFoundResponse({ description: 'Site not found' })
  create(@Body() createMachineDto: CreateMachineDto) {
    return this.machineryService.create(createMachineDto);
  }

  @Get()
  @ApiOkResponse({ type: [MachineResponseDto] })
  findAll() {
    return this.machineryService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: MachineResponseDto })
  @ApiNotFoundResponse({ description: 'Machine not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.machineryService.findOne(id);
  }

  @Get(':id/status')
  @ApiOkResponse({ type: MachineStatusResponseDto })
  @ApiNotFoundResponse({ description: 'Machine not found' })
  getStatus(@Param('id', ParseIntPipe) id: number) {
    return this.machineryService.getStatus(id);
  }
}
