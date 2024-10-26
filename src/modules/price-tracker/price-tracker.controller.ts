import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { PriceTrackerService } from './price-tracker.service'

@Controller('price-tracker')
export class PriceTrackerController {
  constructor(public readonly priceTrackerService: PriceTrackerService) {}

  @Get('listen-events')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'listen primary events' })
  async listenPrimarySaleEvents() {
    // return await this.priceTrackerService.listenPrimarySaleEvents()
  }
}
