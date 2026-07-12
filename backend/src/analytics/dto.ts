import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
export class AnalyticsQueryDto { @IsOptional() @IsString() machineIds?: string; @IsOptional() @IsString() machineId?: string; @IsOptional() @IsString() siteId?: string; @IsDateString() from: string; @IsDateString() to: string; @IsOptional() @IsIn(['daily','weekly']) groupBy: 'daily'|'weekly' = 'daily'; }
export class IncidentQueryDto { @IsOptional() @IsString() severity?: string; @IsOptional() @IsString() status?: string; @IsOptional() @IsString() machineId?: string; @IsOptional() @IsString() siteId?: string; }
export class UpdateIncidentStatusDto { @IsString() status: string; }
