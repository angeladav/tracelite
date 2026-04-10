import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@tracelite/db';
import { RedisProvider } from './redis.provider';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, RedisProvider],
})
export class AppModule {}
