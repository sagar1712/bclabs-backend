import { Column, Entity, PrimaryColumn } from 'typeorm'
import { PriceTrackerInterface } from './price-tracker.interface'
import { CreatedModified } from 'src/helpers'

@Entity()
export class PriceTracker extends CreatedModified implements PriceTrackerInterface {
  @PrimaryColumn()
  id: string

  @Column({
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value,
    },
  })
  nftContract: string

  @Column({ nullable: true })
  boughtAt: Date

  @Column({ type: 'bigint' })
  price: string

  @Column({ nullable: true })
  totalUnits: number

  @Column({ nullable: true })
  fees: number
}
