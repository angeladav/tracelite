import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { TrackingModule } from './tracking/tracking.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';


@Module({
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  imports: [DatabaseModule, HealthModule, AuthModule, OrganizationsModule, ApiKeysModule, TrackingModule, AnalyticsModule, QueueModule,
    ThrottlerModule.forRoot({
      throttlers: [{
        limit: 10,       // Max 10 requests
        ttl: seconds(60) // Per 60 seconds
      }],
      storage: new ThrottlerStorageRedisService(
        new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        }),
      ),
    }),

  ],
})
export class AppModule { }
