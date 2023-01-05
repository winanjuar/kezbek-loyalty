import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  poin: number;

  @Column()
  total_trx: number;

  @Column({ nullable: true })
  remark: string;

  @Column('uuid')
  tier_id: string;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}
