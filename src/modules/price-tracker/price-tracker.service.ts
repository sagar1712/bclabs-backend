import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PriceTracker } from './price-tracker.entity'
import { Repository } from 'typeorm'


@Injectable()
export class PriceTrackerService {
  logger: Logger
  constructor(
    @InjectRepository(PriceTracker)
    public readonly priceTrackerRepository: Repository<PriceTracker>
  ) {
    this.logger = new Logger()
  }
}
