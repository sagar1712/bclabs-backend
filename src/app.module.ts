import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PriceTrackerModule } from './modules/price-tracker/price-tracker.module';
import { dataSourceOptions } from './databases/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), PriceTrackerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
