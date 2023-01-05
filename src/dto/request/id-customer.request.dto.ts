import { PickType } from '@nestjs/swagger';
import { LoyaltyTransactionRequestDto } from './loyalty-transaction.request.dto';

export class IdCustomerRequestDto extends PickType(
  LoyaltyTransactionRequestDto,
  ['customer_id'],
) {}
