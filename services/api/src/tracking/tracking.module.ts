import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { QueueService } from 'src/queue/queue.service';
import { RedisProvider } from 'src/queue/redis.provider';

@Module({
  providers: [TrackingService, QueueService, RedisProvider],
  controllers: [TrackingController]
})
export class TrackingModule { }
