import { Module } from '@nestjs/common'
import { PriceTrackerService } from './price-tracker.service';
import { PriceTrackerController } from './price-tracker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alerts, Prices } from './price-tracker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prices, Alerts])],
  controllers: [PriceTrackerController],
  providers: [PriceTrackerService],
  exports: [PriceTrackerService],
})
export class PriceTrackerModule {}
