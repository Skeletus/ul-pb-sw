import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, StreamableFile, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FinalReportDto } from '../dto/final-report.dto';
import { FinalOptimizationService } from '../services/final-optimization.service';
type AuthRequest=Request&{user:{id:number}};
@Controller('reports/final-optimization') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('ADMINISTRATOR')
export class FinalReportsController { constructor(private readonly service:FinalOptimizationService){}
 @Post() create(@Req()r:AuthRequest,@Body()dto:FinalReportDto){return this.service.generate(r.user.id,dto)}
 @Get() list(){return this.service.list()}
 @Get(':id') one(@Param('id',ParseIntPipe)id:number){return this.service.one(id)}
 @Get(':id/export') async export(@Param('id',ParseIntPipe)id:number,@Req()r:AuthRequest){return new StreamableFile(await this.service.export(id,r.user.id),{type:'application/pdf',disposition:`attachment; filename="workmeter-final-${id}.pdf"`})}
}
