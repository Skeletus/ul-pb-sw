import { ApiProperty } from '@nestjs/swagger';

export class MachineResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  siteId: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  currentStatus: string;

  @ApiProperty()
  hourlyRate: string;
}
