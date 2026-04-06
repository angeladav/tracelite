import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '@tracelite/db';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { TrackingModule } from './tracking/tracking.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { QueueModule } from './queue/queue.module';

@Module({
  controllers: [HealthController],
  providers: [PrismaService],
  imports: [AuthModule, OrganizationsModule, ApiKeysModule, TrackingModule, AnalyticsModule, QueueModule],
})
export class AppModule {}
