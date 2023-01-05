import { Injectable } from '@nestjs/common';
import { LoyaltyTierJourney } from 'src/entity/loyalty-tier-journey.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LoyaltyTierJourneyRepository extends Repository<LoyaltyTierJourney> {
  constructor(private readonly dataSource: DataSource) {
    super(LoyaltyTierJourney, dataSource.createEntityManager());
  }

  async getTierJourneyById(id: string) {
    return await this.findOneBy({ current_tier: id });
  }
}
