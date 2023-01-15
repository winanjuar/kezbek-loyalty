import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class BaseLoyaltyCustomerActualDto {
  @ApiProperty()
  @IsUUID()
  customer_id: string;

  @ApiProperty()
  @IsNumber()
  total_trx: number;

  @ApiProperty()
  @IsString()
  tier: string;

  @ApiProperty()
  @IsNumber()
  max_trx: number;
}
