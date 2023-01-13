import { ApiProperty } from '@nestjs/swagger';
import { LoyaltyCustomerActualDto } from '../loyalty-customer-actual.dto';
import { BaseResponseDto } from './base.response.dto';

export class LoyaltyCustomerActualResponseDto extends BaseResponseDto {
  constructor(
    statusCode: number,
    message: string,
    data: LoyaltyCustomerActualDto,
  ) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample get single data successfully',
  })
  message: string;

  @ApiProperty({ type: LoyaltyCustomerActualDto })
  data: LoyaltyCustomerActualDto;
}
