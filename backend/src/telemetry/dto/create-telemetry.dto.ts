import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class CreateTelemetryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  machineId: number;

  @ApiProperty({ example: 0.75, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  vibrationValue: number;

  @ApiProperty({ example: 12.4, minimum: 0, maximum: 100000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100000)
  energyConsumption: number;

  @ApiPropertyOptional({ example: '2026-07-08T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
