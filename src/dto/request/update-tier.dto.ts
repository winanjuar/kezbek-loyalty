import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class UpdateTierDto {
  @ApiProperty()
  @IsUUID(4)
  tier_id: string;

  @ApiProperty()
  @IsNumber()
  total_trx: number;

  @ApiProperty()
  @IsNumber()
  days_without_trx: number;
}
