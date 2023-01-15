import { ApiProperty } from '@nestjs/swagger';
import { LoyaltyTierMasterPointDto } from '../loyalty-tier-master-point.dto';
import { BaseResponseDto } from './base.response.dto';

export class TierMasterPointResponseDto extends BaseResponseDto {
  constructor(
    statusCode: number,
    message: string,
    data: LoyaltyTierMasterPointDto[],
  ) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample message get data successfully',
  })
  message: string;

  @ApiProperty({ type: [LoyaltyTierMasterPointDto] })
  data: LoyaltyTierMasterPointDto[];
}
