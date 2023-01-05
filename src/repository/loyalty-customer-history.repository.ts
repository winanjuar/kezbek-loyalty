import { Injectable } from '@nestjs/common';
import { LoyaltyCustomerHistory } from 'src/entity/loyalty-customer-history.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LoyaltyCustomerHistoryRepository extends Repository<LoyaltyCustomerHistory> {
  constructor(private readonly dataSource: DataSource) {
    super(LoyaltyCustomerHistory, dataSource.createEntityManager());
  }

  async getLoyaltyHistory(customer_id: string) {
    return this.find({ where: { customer_id } });
  }

  async saveCurrentLoyalty(data: Partial<LoyaltyCustomerHistory>) {
    return this.save(data);
  }
}
