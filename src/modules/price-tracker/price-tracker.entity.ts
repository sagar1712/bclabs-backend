import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { CreatedModified } from '../../helpers';
import {
  AlertsInterface,
  ChainEnum,
  PricesInterface,
} from './price-tracker.interface';

@Entity()
export class Prices extends CreatedModified implements PricesInterface {
  @PrimaryColumn()
  id: string;

  @Column()
  chain: ChainEnum;

  @Column('decimal')
  price: number;

  @CreateDateColumn()
  timestamp!: Date;
}

@Entity()
export class Alerts extends CreatedModified implements AlertsInterface {
  @PrimaryColumn()
  id: string;

  @Column()
  chain: string;

  @Column()
  targetPrice: number;

  @Column()
  email: string;

  @Column()
  isTriggered: boolean;
}
