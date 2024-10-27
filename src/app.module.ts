import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PriceTrackerModule } from './modules/price-tracker/price-tracker.module';
import { dataSourceOptions } from './databases/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), ScheduleModule.forRoot(), PriceTrackerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
