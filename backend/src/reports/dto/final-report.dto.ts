import { IsDateString, IsOptional, IsString } from 'class-validator';
export class FinalReportDto { @IsOptional() @IsString() siteId?: string; @IsOptional() @IsString() machineIds?: string; @IsDateString() from: string; @IsDateString() to: string; }
