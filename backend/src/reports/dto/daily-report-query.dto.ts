import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, Matches } from 'class-validator';

export class DailyReportQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  machineId: number;

  @ApiProperty({ example: '2026-07-08' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;
}
