import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { LoyaltyPointConfigDto } from './loyalty-point-config.dto';
import { LoyaltyTierMasterDto } from './loyalty-tier-master.dto';

export class LoyaltyTierMasterPointDto extends LoyaltyTierMasterDto {
  @ApiProperty({ type: [LoyaltyPointConfigDto] })
  @IsArray()
  points: LoyaltyPointConfigDto[];
}
