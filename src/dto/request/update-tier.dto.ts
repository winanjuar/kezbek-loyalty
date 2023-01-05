import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateTierDto {
  @ApiProperty()
  @IsUUID(4)
  tier_id: string;

  @ApiProperty()
  @IsNumber()
  total_trx: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  transaction_time: Date;
}
