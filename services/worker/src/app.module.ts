import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsumerModule } from './consumer/consumer.module';
import { AggregationModule } from './aggregation/aggregation.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConsumerModule, AggregationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
