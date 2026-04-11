import { Module } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { PrismaService } from '@tracelite/db';

@Module({
  providers: [AggregationService, PrismaService],
  exports: [AggregationService],
})
export class AggregationModule {}
