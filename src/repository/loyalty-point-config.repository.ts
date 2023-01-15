import { Injectable } from '@nestjs/common';
import { LoyaltyPointConfig } from 'src/entity/loyalty-point-config.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LoyaltyPointConfigRepository extends Repository<LoyaltyPointConfig> {
  constructor(private readonly dataSource: DataSource) {
    super(LoyaltyPointConfig, dataSource.createEntityManager());
  }

  async getLoyaltyPoint(tier_id: string, expected: number) {
    const loyaltyConfig = await this.findOne({
      where: { tier: { id: tier_id }, at_trx: expected },
      relations: ['tier'],
    });

    if (!loyaltyConfig) return 0;

    return loyaltyConfig.point;
  }
}
