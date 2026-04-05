import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '@tracelite/db';

@Module({
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
