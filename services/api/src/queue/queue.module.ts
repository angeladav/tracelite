import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RedisProvider } from './redis.provider';

@Module({
  providers: [QueueService, RedisProvider]
})
export class QueueModule { }
