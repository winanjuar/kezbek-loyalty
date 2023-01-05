import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class LoyaltyTransactionRequestDto {
  @ApiProperty()
  @IsUUID(4)
  customer_id: string;

  @ApiProperty()
  @IsUUID(4)
  transaction_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  transaction_time: Date;
}
