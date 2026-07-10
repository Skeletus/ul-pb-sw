import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class EnergyConsumptionQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @IsIn(['HOUR', 'DAY'])
  interval?: 'HOUR' | 'DAY';
}
