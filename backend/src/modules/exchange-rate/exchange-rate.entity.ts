import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { CURRENCY } from './exchange-rate.constants';
import { pick } from 'lodash';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 3 })
  from: CURRENCY;

  @Column({ type: 'varchar', length: 3 })
  to: CURRENCY;

  @Column({ type: 'real' })
  rate: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: boolean;

  toResponse() {
    return pick(this, 'from', 'to', 'rate');
  }
}
