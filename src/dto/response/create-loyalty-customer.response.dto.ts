import { ApiProperty } from '@nestjs/swagger';
import { LoyaltyCustomerDto } from '../loyalty-customer.dto';
import { BaseResponseDto } from './base.response.dto';

export class CreateLoyaltyCustomerResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: LoyaltyCustomerDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample message create new entity successfully',
  })
  message: string;

  @ApiProperty({ type: LoyaltyCustomerDto })
  data: LoyaltyCustomerDto;
}
