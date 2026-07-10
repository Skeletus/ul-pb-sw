import { IsString, MaxLength } from 'class-validator';

export class CreateSensorDto {
  @IsString()
  @MaxLength(80)
  identifier: string;

  @IsString()
  @MaxLength(60)
  type: string;
}
