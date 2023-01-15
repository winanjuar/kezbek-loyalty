import { ApiProperty } from '@nestjs/swagger';
import { LoyaltyCustomerDto } from '../loyalty-customer.dto';
import { BaseResponseDto } from './base.response.dto';

export class ResultLoyaltyCustomerResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: LoyaltyCustomerDto[]) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample message get result successfully',
  })
  message: string;

  @ApiProperty({ type: [LoyaltyCustomerDto] })
  data: LoyaltyCustomerDto[];
}
