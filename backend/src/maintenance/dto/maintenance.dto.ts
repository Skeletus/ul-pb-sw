import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
export class CreateMaintenanceDto {
  @IsDateString() maintenanceDate: string;
  @IsString() @MinLength(1) @MaxLength(80) type: string;
  @IsString() @MinLength(1) @MaxLength(1200) description: string;
  @IsString() @MaxLength(40) status: string;
  @IsNumber() @Min(0) cost: number;
  @IsOptional() @IsString() @MaxLength(160) provider?: string;
  @IsOptional() @IsDateString() nextMaintenanceDate?: string;
}
export class UpdateMaintenanceDto extends CreateMaintenanceDto {}
