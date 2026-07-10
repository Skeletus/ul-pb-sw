import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsPositive } from 'class-validator';
export class SavingsProjectionQueryDto { @Type(() => Number) @IsInt() @IsPositive() machineId: number; @IsDateString() startDate: string; @IsDateString() endDate: string; }
