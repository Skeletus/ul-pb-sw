import { IncidentSeverity } from '@prisma/client';
import { IsEnum, IsString, MaxLength } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;
}
