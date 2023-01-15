import { ApiProperty } from '@nestjs/swagger';
import { BaseLoyaltyCustomerActualDto } from '../base-loyalty-customer-actual.dto';
import { BaseResponseDto } from './base.response.dto';

export class BaseLoyaltyCustomerActualResponseDto extends BaseResponseDto {
  constructor(
    statusCode: number,
    message: string,
    data: BaseLoyaltyCustomerActualDto,
  ) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample message get loyalty actual',
  })
  message: string;

  @ApiProperty({ type: BaseLoyaltyCustomerActualDto })
  data: BaseLoyaltyCustomerActualDto;
}
