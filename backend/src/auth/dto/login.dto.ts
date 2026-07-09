import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'demo@workmeter.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo123456', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
