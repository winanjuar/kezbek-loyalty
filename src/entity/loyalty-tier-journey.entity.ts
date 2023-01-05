import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('loyalty_tier_journey')
export class LoyaltyTierJourney {
  @PrimaryColumn('uuid')
  current_tier: string;

  @Column('uuid')
  next_1: string;

  @Column('uuid')
  prev_1: number;

  @Column('uuid')
  prev_2: number;
}
