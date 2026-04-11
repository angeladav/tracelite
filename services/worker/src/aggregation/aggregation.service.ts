import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AggPeriod, Prisma } from '@prisma/client';
import { PrismaService } from '@tracelite/db';
import { RETENTION_DAYS } from '@tracelite/common';

type MinuteOrgAggRow = {
  organizationId: string;
  total_requests: bigint;
  error_count: bigint;
  avg_latency: number | null;
  p95_latency: number | null;
  p99_latency: number | null;
};

@Injectable()
export class AggregationService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    private startOfUtcMinute(d: Date): Date {
        return new Date(Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            d.getUTCHours(),
            d.getUTCMinutes(),
            0,
            0,
        ));
    }
        
    private startOfUtcHour(d: Date): Date {
        return new Date(Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            d.getUTCHours(),
            0,
            0,
            0,
        ));
    }
        
    private startOfUtcDay(d: Date): Date {
        return new Date(Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            0,
            0,
            0,
            0,
        ));
    }
        
    private addMinutes(d: Date, n: number): Date {
        return new Date(d.getTime() + n * 60_000);
    }
        
    private addHours(d: Date, n: number): Date {
        return new Date(d.getTime() + n * 3_600_000);
    }
        
    private addDays(d: Date, n: number): Date {
        return new Date(Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate() + n,
            0,
            0,
            0,
            0,
        ));
    }
    
    private async deleteExpiredRequestLogs(todayStartUtc: Date): Promise<void> {
        const BATCH = 1000;
        for (const [planKey, retentionDays] of Object.entries(RETENTION_DAYS)) {
            const cutOffDate = this.addDays(todayStartUtc, -retentionDays);
            for (;;) {
                const deleted = await this.prisma.$executeRaw(
                    Prisma.sql`
            DELETE FROM "RequestLog" rl
            WHERE rl."id" IN (
              SELECT rl2."id"
              FROM "RequestLog" rl2
              INNER JOIN "Organization" o ON o."id" = rl2."organizationId"
              WHERE o."plan" = CAST(${planKey} AS "PlanType")
                AND rl2."timestamp" < ${cutOffDate}
              LIMIT ${BATCH}
            )
          `,
                );
                const n = typeof deleted === 'number' ? deleted : Number(deleted);
                if (n < BATCH) {
                    break;
                }
            }
        }
    }
    

    private async aggregateBucketOrgRollup(
        periodStart: Date,
        periodEnd: Date,
        period: AggPeriod
    ): Promise<void> {
        const rows = await this.prisma.$queryRaw<MinuteOrgAggRow[]>(Prisma.sql`
      SELECT
        rl."organizationId" AS "organizationId",
        COUNT(*)::bigint AS total_requests,
        COUNT(*) FILTER (WHERE rl."statusCode" >= 400)::bigint AS error_count,
        AVG(rl."latencyMs")::float AS avg_latency,
        COALESCE(
          percentile_cont(0.95) WITHIN GROUP (ORDER BY rl."latencyMs"),
          0
        )::float AS p95_latency,
        COALESCE(
          percentile_cont(0.99) WITHIN GROUP (ORDER BY rl."latencyMs"),
          0
        )::float AS p99_latency
      FROM "RequestLog" rl
      WHERE rl."timestamp" >= ${periodStart}
        AND rl."timestamp" < ${periodEnd}
      GROUP BY rl."organizationId"
    `);

        for (const r of rows) {
            const totalRequests = Number(r.total_requests);
            const errorCount = Number(r.error_count);
            const avgLatencyMs = r.avg_latency ?? 0;
            const p95LatencyMs = r.p95_latency ?? 0;
            const p99LatencyMs = r.p99_latency ?? 0;

            await this.prisma.aggregatedMetric.upsert({
                where: {
                    organizationId_apiKeyId_endpoint_period_periodStart: {
                        organizationId: r.organizationId,
                        apiKeyId: null,
                        endpoint: null,
                        period,
                        periodStart,
                    } as unknown as Prisma.AggregatedMetricOrganizationIdApiKeyIdEndpointPeriodPeriodStartCompoundUniqueInput,
                },
                create: {
                    organizationId: r.organizationId,
                    apiKeyId: null,
                    endpoint: null,
                    period,
                    periodStart,
                    totalRequests,
                    errorCount,
                    avgLatencyMs,
                    p95LatencyMs,
                    p99LatencyMs,
                },
                update: {
                    totalRequests,
                    errorCount,
                    avgLatencyMs,
                    p95LatencyMs,
                    p99LatencyMs,
                },
            });
        }
    }

    @Cron('* * * * *')
    async minAggregate() {
        const now = new Date();
        const minStartNow = this.startOfUtcMinute(now);
        const periodStarts = [
            this.addMinutes(minStartNow, -2),
            this.addMinutes(minStartNow, -1),
        ];

        for (const periodStart of periodStarts) {
            const periodEnd = this.addMinutes(periodStart, 1);
            await this.aggregateBucketOrgRollup(periodStart, periodEnd, AggPeriod.MINUTE);
        }
    }

    @Cron('0 * * * *')
    async hourAggregate() {
        const now = new Date();
        const hourStartNow = this.startOfUtcHour(now);
        const periodStarts = [
            this.addHours(hourStartNow, -2),
            this.addHours(hourStartNow, -1),
        ];

        for (const periodStart of periodStarts) {
            const periodEnd = this.addHours(periodStart, 1);
            await this.aggregateBucketOrgRollup(periodStart, periodEnd, AggPeriod.HOUR);
        }
    }
    
    @Cron('0 0 * * *')
    async dayAggregate() {
        const now = new Date();
        const dayStartNow = this.startOfUtcDay(now);
        const periodStarts = [
            this.addDays(dayStartNow, -2),
            this.addDays(dayStartNow, -1),
        ];

        for (const periodStart of periodStarts) {
            const periodEnd = this.addDays(periodStart, 1);
            await this.aggregateBucketOrgRollup(periodStart, periodEnd, AggPeriod.DAY);
        }

        await this.deleteExpiredRequestLogs(dayStartNow);
    }
}
