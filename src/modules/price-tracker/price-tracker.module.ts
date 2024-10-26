import { Module } from '@nestjs/common'
import { PriceTrackerService } from './price-tracker.service';
import { PriceTrackerController } from './price-tracker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceTracker } from './price-tracker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceTracker])],
  controllers: [PriceTrackerController],
  providers: [PriceTrackerService],
  exports: [PriceTrackerService],
})
export class PriceTrackerModule {}
