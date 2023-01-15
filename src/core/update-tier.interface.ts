export interface IUpdateTier {
  customer_id: string;
  tier_id: string;
  total_trx: number;
  days_without_trx: number;
}
