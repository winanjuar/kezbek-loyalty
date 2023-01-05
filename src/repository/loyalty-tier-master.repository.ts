import { Injectable } from '@nestjs/common';
import { LoyaltyTierMaster } from 'src/entity/loyalty-tier-master.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LoyaltyTierMasterRepository extends Repository<LoyaltyTierMaster> {
  constructor(private readonly dataSource: DataSource) {
    super(LoyaltyTierMaster, dataSource.createEntityManager());
  }

  async getTierMasterById(id: string) {
    return await this.findOneBy({ id });
  }

  async getTierMaster(level: number) {
    return await this.findOne({ where: { level } });
  }
}
