import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator'; import { RolesGuard } from '../../common/guards/roles.guard';
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
  create(@Body() createMachineDto: CreateMachineDto, @Req() request: Request & { user?: { id: number } }) {
    return this.machineryService.create(createMachineDto, request.user?.id);
  }

  @Get()
  @ApiOkResponse({ type: [MachineResponseDto] })
  findAll(@Query('siteId') siteId?: string) {
    return this.machineryService.findAll(siteId ? Number(siteId) : undefined);
  }

  @Patch(':id') @UseGuards(RolesGuard) @Roles('ADMINISTRATOR') update(@Param('id',ParseIntPipe)id:number,@Body()dto:{code?:string;type?:string;siteId?:number},@Req()request:Request & {user:{id:number}}){return this.machineryService.update(id,dto,request.user.id)}
  @Patch(':id/decommission') @UseGuards(RolesGuard) @Roles('ADMINISTRATOR') decommission(@Param('id',ParseIntPipe)id:number,@Req()request:Request & {user:{id:number}}){return this.machineryService.decommission(id,request.user.id)}

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
