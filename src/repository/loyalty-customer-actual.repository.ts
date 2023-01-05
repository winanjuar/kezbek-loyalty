import { Injectable } from '@nestjs/common';
import { LoyaltyCustomerActual } from 'src/entity/loyalty-customer-actual.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LoyaltyCustomerActualRepository extends Repository<LoyaltyCustomerActual> {
  constructor(private readonly dataSource: DataSource) {
    super(LoyaltyCustomerActual, dataSource.createEntityManager());
  }

  async getCurrentLoyalty(customer_id: string) {
    return this.findOne({ where: { customer_id }, relations: ['tier'] });
  }

  async saveCurrentLoyalty(data: Partial<LoyaltyCustomerActual>) {
    return this.save(data);
  }
}
