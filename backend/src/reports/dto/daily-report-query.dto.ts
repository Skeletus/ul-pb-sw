import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class DailyReportQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  machineId: number;

  @ApiProperty({ example: '2026-07-08' })
  @IsDateString()
  date: string;
}
