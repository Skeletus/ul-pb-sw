import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateRentalContractDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalCost: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  hourlyRate: number;
}
