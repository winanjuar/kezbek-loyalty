import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LoyaltyTierMaster } from './loyalty-tier-master.entity';

@Entity('loyalty_point_config')
export class LoyaltyPointConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  at_trx: number;

  @Column()
  point: number;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @ManyToOne(() => LoyaltyTierMaster, (master) => master.id)
  @JoinColumn({ name: 'tier_id' })
  tier: LoyaltyTierMaster;
}
