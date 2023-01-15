import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LoyaltyTierMaster } from './loyalty-tier-master.entity';

@Entity('loyalty_customer_history')
export class LoyaltyCustomerHistory {
  @PrimaryColumn('uuid')
  transaction_id: string;

  @Index()
  @Column('uuid')
  customer_id: string;

  @Column()
  transaction_time: Date;

  @Column()
  point: number;

  @Column()
  total_trx: number;

  @Column({ nullable: true })
  remark: string;

  @ManyToOne(() => LoyaltyTierMaster, (master) => master.id)
  @JoinColumn({ name: 'tier_id' })
  tier: LoyaltyTierMaster;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}
