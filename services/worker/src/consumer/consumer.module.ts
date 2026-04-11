import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { PrismaService } from '@tracelite/db';
import { RedisProvider } from './redis.provider';

@Module({
  providers: [ConsumerService, PrismaService, RedisProvider],
  imports: [ConsumerModule],
})
export class ConsumerModule {}
