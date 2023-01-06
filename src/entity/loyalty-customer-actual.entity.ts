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

@Entity('loyalty_customer_actual')
export class LoyaltyCustomerActual {
  @PrimaryColumn('uuid')
  customer_id: string;

  @Index()
  @Column('uuid')
  transaction_id: string;

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
