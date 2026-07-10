import { IsString } from 'class-validator';

export class AssociateSensorDto {
  @IsString()
  identifier: string;
}
