import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuditAction, AuditResult } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

class AuditQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @IsPositive() userId?: number;
  @IsOptional() @IsEnum(AuditAction) action?: AuditAction;
  @IsOptional() @IsString() resource?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsEnum(AuditResult) result?: AuditResult;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}

@Controller('audit-logs') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMINISTRATOR')
export class AuditController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}
  @Get()
  async findAll(@Query() query: AuditQueryDto) {
    const where = { userId: query.userId, action: query.action, resource: query.resource,
      result: query.result, occurredAt: query.from || query.to ? { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined } : undefined };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { occurredAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) };
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.prisma.auditLog.findUniqueOrThrow({ where: { id }, include: { user: { select: { id: true, name: true, email: true } } } }); }
}
