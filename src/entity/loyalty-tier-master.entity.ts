import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LoyaltyPointConfig } from './loyalty-point-config.entity';

@Entity('loyalty_tier_master')
export class LoyaltyTierMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  level: number;

  @Column()
  max_trx: number;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @OneToMany(() => LoyaltyPointConfig, (config) => config.tier)
  @JoinColumn({ name: 'tier_id' })
  points: LoyaltyPointConfig[];
}
