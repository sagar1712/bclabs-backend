export interface PriceTrackerInterface {
    id?: string
    nftContract: string
    boughtAt?: Date
    price: string
    totalUnits: number
    fees: number
  }
  