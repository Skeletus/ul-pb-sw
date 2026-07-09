import { ApiProperty } from '@nestjs/swagger';

export class MachineStatusResponseDto {
  @ApiProperty()
  machineId: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  currentStatus: string;

  @ApiProperty({ required: false, nullable: true })
  lastStateStartDate: Date | null;
}
