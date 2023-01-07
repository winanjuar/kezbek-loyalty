import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';
import { LoyaltyTierMasterDto } from './loyalty-tier-master.dto';

export class LoyaltyCustomerActualDto {
  @ApiProperty()
  @IsUUID()
  customer_id: string;

  @ApiProperty()
  @IsUUID()
  transaction_id: string;

  @ApiProperty()
  @IsDate()
  transaction_time: Date;

  @ApiProperty()
  @IsNumber()
  point: number;

  @ApiProperty()
  @IsNumber()
  total_trx: number;

  @ApiProperty()
  @IsString()
  remark: string;

  @ApiProperty()
  tier: LoyaltyTierMasterDto;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsDate()
  updated_at: Date;
}
