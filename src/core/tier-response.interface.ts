import { LoyaltyTierMaster } from 'src/entity/loyalty-tier-master.entity';
import { ETierStatus } from './tier-status.enum';
import { ETierRemark } from './tier-remark.enum';

export interface ITierResponse {
  status: ETierStatus;
  current_tier: LoyaltyTierMaster;
  total_trx: number;
  remark: ETierRemark;
}
