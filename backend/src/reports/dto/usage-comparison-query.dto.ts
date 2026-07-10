import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, Matches, Max, Min } from 'class-validator';

export class UsageComparisonQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  lowUtilizationThreshold?: number;
}
