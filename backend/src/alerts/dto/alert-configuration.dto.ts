import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class AlertConfigurationDto {
  @IsInt()
  @Min(1)
  inactivityThresholdMinutes!: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
