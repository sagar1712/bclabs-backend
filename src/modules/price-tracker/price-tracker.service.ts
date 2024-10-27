import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import { CreateAlertDto } from './price-tracker.dto';
import { Alerts, Prices } from './price-tracker.entity';
import {
  AlertsInterface,
  ChainEnum,
  ChainNameEnum,
  IHourlyPrice,
  ISwapRate,
} from './price-tracker.interface';
import { getAlertsBy } from './price-tracker.respository';

@Injectable()
export class PriceTrackerService {
  private transporter;
  logger: Logger;
  constructor(
    @InjectRepository(Prices)
    public readonly priceRepository: Repository<Prices>,
    @InjectRepository(Alerts)
    private alertRepository: Repository<Alerts>,
  ) {
    this.logger = new Logger();
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchAndStorePrices() {
    try {
      const ethPrice = await this.fetchPriceFromAPI(ChainEnum.Ethereum);
      const polygonPrice = await this.fetchPriceFromAPI(ChainEnum.Polygon);

      await this.priceRepository.save({
        id: uuid(),
        chain: ChainEnum.Ethereum,
        price: ethPrice,
      });
      await this.priceRepository.save({
        id: uuid(),
        chain: ChainEnum.Polygon,
        price: polygonPrice,
      });

      // Check for price alerts and 3% increase
      await this.checkPriceAlerts(
        ChainEnum.Ethereum,
        ChainNameEnum.Ethereum,
        ethPrice,
      );
      await this.checkPriceAlerts(
        ChainEnum.Polygon,
        ChainNameEnum.Polygon,
        polygonPrice,
      );

      await this.checkHourlyPriceIncrease(
        ChainEnum.Ethereum,
        ChainNameEnum.Ethereum,
        ethPrice,
      );
      await this.checkHourlyPriceIncrease(
        ChainEnum.Polygon,
        ChainNameEnum.Polygon,
        polygonPrice,
      );

      this.logger.log('Prices fetched and processed successfully.');
    } catch (error) {
      this.logger.error('Error fetching or storing prices', error.stack);
      throw new BadRequestException('Failed to fetch/store prices');
    }
  }

  private async fetchPriceFromAPI(chain: ChainEnum): Promise<number> {
    try {
      const response = await axios.get(process.env.CMC_API_URL, {
        params: {
          id: chain,
        },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
          Accept: 'application/json',
        },
      });

      const price = response.data.data[chain].quote.USD.price;

      return price;
    } catch (error) {
      console.error('Error fetching price from CoinMarketCap:', error);
      throw new Error('Failed to fetch price from CoinMarketCap');
    }
  }

  async getHourlyPrices(): Promise<IHourlyPrice[]> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const ethPrices = await this.priceRepository
      .createQueryBuilder()
      .where('chain = :chain AND timestamp >= :last24Hours', {
        chain: ChainEnum.Ethereum,
        last24Hours,
      })
      .orderBy('timestamp', 'ASC')
      .getMany();

    const polygonPrices = await this.priceRepository
      .createQueryBuilder()
      .where('chain = :chain AND timestamp >= :last24Hours', {
        chain: ChainEnum.Polygon,
        last24Hours,
      })
      .orderBy('timestamp', 'ASC')
      .getMany();

    return [
      {
        chain: 'Ethereum',
        prices: ethPrices.map((p) => ({
          price: p.price,
          timestamp: p.timestamp,
        })),
      },
      {
        chain: 'Polygon',
        prices: polygonPrices.map((p) => ({
          price: p.price,
          timestamp: p.timestamp,
        })),
      },
    ];
  }

  async createAlert(createAlertDto: CreateAlertDto): Promise<AlertsInterface> {
    const alert = {
      id: uuid(),
      chain: ChainEnum[createAlertDto.chain],
      targetPrice: createAlertDto.targetPrice,
      email: createAlertDto.email,
      isTriggered: false,
    };
    await this.alertRepository.save(alert);
    return alert;
  }

  async calculateSwapRate(ethAmount: number): Promise<ISwapRate> {
    const FEE_PERCENTAGE = 0.03;

    const ethToBtcRate = await this.fetchEthToBtcRate();
    const btcAmount = ethAmount * ethToBtcRate;

    const feeEth = ethAmount * FEE_PERCENTAGE;
    const feeUsd = feeEth * (await this.fetchEthUsdRate());

    return {
      btcAmount: btcAmount - btcAmount * FEE_PERCENTAGE,
      fee: {
        eth: feeEth,
        usd: feeUsd,
      },
    };
  }

  async fetchEthToBtcRate(): Promise<number> {
    try {
      const response = await axios.get(process.env.CMC_API_URL, {
        params: {
          id: '1027,1',
        },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
          Accept: 'application/json',
        },
      });

      const ethUsdPrice = response.data.data['1027'].quote.USD.price;
      const btcUsdPrice = response.data.data['1'].quote.USD.price;

      return ethUsdPrice / btcUsdPrice; // ETH to BTC rate
    } catch (error) {
      console.error('Error fetching ETH to BTC rate:', error);
      throw new Error('Failed to fetch ETH to BTC rate');
    }
  }

  async fetchEthUsdRate(): Promise<number> {
    try {
      const response = await axios.get(process.env.CMC_API_URL, {
        params: { id: '1027' }, // ETH ID
        headers: { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY },
      });

      const ethUsdPrice = response.data.data['1027'].quote.USD.price;
      return ethUsdPrice; // ETH to USD rate
    } catch (error) {
      console.error('Error fetching ETH to USD rate:', error);
      throw new Error('Failed to fetch ETH to USD rate');
    }
  }

  private async checkPriceAlerts(
    chain: ChainEnum,
    chainName: ChainNameEnum,
    currentPrice: number,
  ) {
    const alerts = await getAlertsBy({ chain, isTriggered: false });

    for (const alert of alerts) {
      if (currentPrice >= alert.targetPrice) {
        await this.sendEmail(
          alert.email,
          'BC labs Price Alert',
          `Price Alert: ${chainName} has reached $${currentPrice}`,
        );
        alert.isTriggered = true;
        await this.alertRepository.save(alert);
      }
    }
  }

  private async checkHourlyPriceIncrease(
    chain: ChainEnum,
    chainName: ChainNameEnum,
    currentPrice: number,
  ) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const lastHourPrice = await this.priceRepository
      .createQueryBuilder()
      .where('chain = :chain AND timestamp <= :oneHourAgo', {
        chain,
        oneHourAgo,
      })
      .orderBy('timestamp', 'DESC')
      .getOne();

    if (
      lastHourPrice &&
      (currentPrice - lastHourPrice.price) / lastHourPrice.price >= 0.03
    ) {
      await this.sendEmail(
        'hyperhire_assignment@hyperhire.in',
        'BC labs Price Alert',
        `Price Alert: ${chainName} price has increased by more than 3%`,
      );
    }
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      console.log(to, subject, text);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
      };

      console.log(mailOptions);
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
