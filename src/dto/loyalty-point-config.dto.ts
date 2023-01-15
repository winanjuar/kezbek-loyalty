import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

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
}
