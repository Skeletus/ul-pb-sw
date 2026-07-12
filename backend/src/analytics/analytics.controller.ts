import { Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards, Body } from '@nestjs/common';
import { IncidentStatus } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto, IncidentQueryDto, UpdateIncidentStatusDto } from './dto';
type ReqUser=Request&{user:{id:number}};
@Controller() @UseGuards(JwtAuthGuard)
export class AnalyticsController { constructor(private readonly service:AnalyticsService){}
 @Get('analytics/machines/comparison') comparison(@Query()q:AnalyticsQueryDto){return this.service.comparison(q)}
 @Get('analytics/usage-trends') trends(@Query()q:AnalyticsQueryDto){return this.service.trends(q)}
 @Get('incidents') incidents(@Query()q:IncidentQueryDto){return this.service.prioritized(q)}
 @Get('incidents/prioritized') prioritized(@Query()q:IncidentQueryDto){return this.incidents(q)}
 @Patch('incidents/:id/status') status(@Param('id',ParseIntPipe)id:number,@Req()req:ReqUser,@Body()dto:UpdateIncidentStatusDto){return this.service.updateIncident(id,req.user.id,dto.status as IncidentStatus)}
}
