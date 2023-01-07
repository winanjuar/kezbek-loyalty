import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { LoyaltyTierMasterDto } from './loyalty-tier-master.dto';

export class LoyaltyPointConfigDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  at_trx: number;

  @ApiProperty()
  @IsNumber()
  point: number;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsDate()
  updated_at: Date;

  @ApiProperty()
  @IsDate()
  deleted_at: Date;

  @ApiProperty()
  @IsDate()
  tier: LoyaltyTierMasterDto;
}
