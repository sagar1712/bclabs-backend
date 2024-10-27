export interface PricesInterface {
  id: string;
  chain: ChainEnum;
  price: number;
  timestamp: Date;
}

export interface AlertsInterface {
  id: string;
  chain: string;
  targetPrice: number;
  email: string;
  isTriggered: boolean;
}

export interface IHourlyPrice {
  chain: string;
  prices: {
    price: number;
    timestamp: Date;
  }[];
}

export interface ISwapRate {
  btcAmount: number;
  fee: {
    eth: number;
    usd: number;
  };
}

export enum ChainNameEnum {
  Ethereum = 'Ethereum',
  Polygon = 'Polygon',
}

export enum ChainEnum {
  Ethereum = '1027',
  Polygon = '3890',
}
