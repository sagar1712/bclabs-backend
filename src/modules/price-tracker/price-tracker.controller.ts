import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateAlertDto, SwapRateDto } from './price-tracker.dto';
import {
  AlertsInterface,
  IHourlyPrice,
  ISwapRate,
} from './price-tracker.interface';
import { PriceTrackerService } from './price-tracker.service';

@Controller('price-tracker')
export class PriceTrackerController {
  constructor(public readonly priceTrackerService: PriceTrackerService) {}

  @Get('hourly-prices')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'hourly token prices fetched successfully' })
  async getHourlyPrices(): Promise<IHourlyPrice[]> {
    return this.priceTrackerService.getHourlyPrices();
  }

  @Post('alerts')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'alert created successfully' })
  async createAlert(
    @Body() createAlertDto: CreateAlertDto,
  ): Promise<AlertsInterface> {
    return this.priceTrackerService.createAlert(createAlertDto);
  }

  @Get('swap-rate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Swap rate fetched successfully' })
  async getSwapRate(@Query() swapRateDto: SwapRateDto): Promise<ISwapRate> {
    return this.priceTrackerService.calculateSwapRate(swapRateDto.ethAmount);
  }
}
