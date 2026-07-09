import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  siteId: number;

  @ApiProperty({ example: 'MACH-001', maxLength: 60 })
  @IsString()
  @MaxLength(60)
  code: string;

  @ApiProperty({ example: 'Excavadora', maxLength: 80 })
  @IsString()
  @MaxLength(80)
  type: string;

  @ApiPropertyOptional({ example: 120.5, description: 'Tarifa horaria minima del MVP' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate?: number;
}
