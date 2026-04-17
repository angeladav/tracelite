import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
} from '@nestjs/common';
import { AggPeriod } from '@tracelite/common';
import { PrismaService } from '@tracelite/db';
import { RequestsDto, TimeseriesDto } from './dto/analytics.dto';
import { Prisma } from '@prisma/client';
import Redis from 'ioredis';

const REDIS_CACHE_KEY_BASE = 'tracelite:cache';

@Injectable()
export class AnalyticsService {

    constructor(
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) {}

    async getOverview(userId: string, organizationId: string) {
        await this.checkPermissions(userId, organizationId);

        try {
            const cachedData = await this.redis.get(`${REDIS_CACHE_KEY_BASE}:overview:${organizationId}`);
            if (cachedData) return JSON.parse(cachedData);
        } catch {}


        const to = new Date();
        const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

        const hourlyRows = await this.prisma.aggregatedMetric.findMany({
            where: {
                organizationId,
                period: AggPeriod.HOUR,
                apiKeyId: null,
                endpoint: null,
                periodStart: {
                    gte: from,
                    lt: to
                }
            },
            select: {
                totalRequests: true,
                errorCount: true,
                avgLatencyMs: true,
                p95LatencyMs: true,
                p99LatencyMs: true
            }
        });

        let totalRequests = 0;
        let errorCount = 0;
        let weightedAvgLatencyNumerator = 0;
        let p95LatencyMs = 0;
        let p99LatencyMs = 0;

        for (const row of hourlyRows) {
            totalRequests += row.totalRequests;
            errorCount += row.errorCount;
            weightedAvgLatencyNumerator += row.avgLatencyMs * row.totalRequests;
            p95LatencyMs = Math.max(p95LatencyMs, row.p95LatencyMs);
            p99LatencyMs = Math.max(p99LatencyMs, row.p99LatencyMs);
        }

        const avgLatencyMs = totalRequests ? weightedAvgLatencyNumerator / totalRequests : 0;
        const errorRate = totalRequests ? errorCount / totalRequests : 0;

        const data = {
            period: AggPeriod.HOUR,
            from,
            to,
            totalRequests,
            errorCount,
            errorRate,
            avgLatencyMs,
            p95LatencyMs,
            p99LatencyMs
        };

        try {
            await this.redis.set(
                `${REDIS_CACHE_KEY_BASE}:overview:${organizationId}`,
                JSON.stringify(data), 
                'EX', 
                60
            );    
        } catch {}


        return data;
    }

    async getEndpoints(userId: string, organizationId: string) {
        await this.checkPermissions(userId, organizationId);

        const to = new Date();
        const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

        const hourlyRows = await this.prisma.aggregatedMetric.findMany({
            where: {
                organizationId,
                period: AggPeriod.HOUR,
                apiKeyId: null,
                endpoint: {
                    not: null
                },
                periodStart: {
                    gte: from,
                    lt: to
                }
            },
            select: {
                endpoint: true,
                totalRequests: true,
                errorCount: true,
                avgLatencyMs: true,
                p95LatencyMs: true,
                p99LatencyMs: true
            }
        });

        const byEndpoint = new Map<string, {
            totalRequests: number;
            errorCount: number;
            weightedAvgLatencyNumerator: number;
            p95LatencyMs: number;
            p99LatencyMs: number;
        }>();

        for (const row of hourlyRows) {
            if (!row.endpoint) continue;

            const current = byEndpoint.get(row.endpoint) ?? {
                totalRequests: 0,
                errorCount: 0,
                weightedAvgLatencyNumerator: 0,
                p95LatencyMs: 0,
                p99LatencyMs: 0
            };

            current.totalRequests += row.totalRequests;
            current.errorCount += row.errorCount;
            current.weightedAvgLatencyNumerator += row.avgLatencyMs * row.totalRequests;
            current.p95LatencyMs = Math.max(current.p95LatencyMs, row.p95LatencyMs);
            current.p99LatencyMs = Math.max(current.p99LatencyMs, row.p99LatencyMs);

            byEndpoint.set(row.endpoint, current);
        }

        const endpoints = [...byEndpoint.entries()]
            .map(([endpoint, stats]) => {
                const avgLatencyMs = stats.totalRequests
                    ? stats.weightedAvgLatencyNumerator / stats.totalRequests
                    : 0;
                const errorRate = stats.totalRequests
                    ? stats.errorCount / stats.totalRequests
                    : 0;

                return {
                    endpoint,
                    totalRequests: stats.totalRequests,
                    errorCount: stats.errorCount,
                    errorRate,
                    avgLatencyMs,
                    p95LatencyMs: stats.p95LatencyMs,
                    p99LatencyMs: stats.p99LatencyMs
                };
            })
            .sort((a, b) => b.totalRequests - a.totalRequests)
            .slice(0, 10);

        return {
            period: AggPeriod.HOUR,
            from,
            to,
            endpoints
        };
    }

    async getRequests(userId: string, requestsDto: RequestsDto) {
        await this.checkPermissions(userId, requestsDto.organizationId);

        const from = new Date(requestsDto.from);
        const to = new Date(requestsDto.to);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
            throw new BadRequestException('Invalid date range');
        }

        const pageSize = requestsDto.take ?? 20;
        const where: Prisma.RequestLogWhereInput = {
            organizationId: requestsDto.organizationId,
            timestamp: {
                gte: from,
                lt: to
            },
            ...(requestsDto.endpoint
                ? {
                    endpoint: {
                        contains: requestsDto.endpoint,
                        mode: 'insensitive'
                    }
                }
                : {}),
            ...(requestsDto.status !== undefined ? { statusCode: requestsDto.status } : {})
        };

        const rows = await this.prisma.requestLog.findMany({
            where,
            ...(requestsDto.cursor
                ? {
                    cursor: {
                        id: requestsDto.cursor
                    },
                    skip: 1
                }
                : {}),
            orderBy: [
                { timestamp: 'desc' },
                { id: 'desc' }
            ],
            take: pageSize + 1
        });

        const hasMore = rows.length > pageSize;
        const data = hasMore ? rows.slice(0, pageSize) : rows;
        const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

        return {
            data,
            pagination: {
                take: pageSize,
                nextCursor,
                hasMore
            }
        };
    }

    async getTimeseries(userId: string,  timeseriesDto: TimeseriesDto) {
        await this.checkPermissions(userId, timeseriesDto.organizationId);

        const from = new Date(timeseriesDto.from);
        const to = new Date(timeseriesDto.to);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
            throw new BadRequestException('Invalid date range');
        }

        const bucketFrom = this.floorToBucket(from, timeseriesDto.period);
        const bucketTo = this.floorToBucket(to, timeseriesDto.period);
        const endExclusive = bucketTo < to ? this.nextBucket(bucketTo, timeseriesDto.period) : bucketTo;
        const cacheKey = [
            REDIS_CACHE_KEY_BASE,
            'timeseries',
            timeseriesDto.organizationId,
            timeseriesDto.period,
            bucketFrom.toISOString(),
            endExclusive.toISOString()
        ].join(':');

        try {
            const cachedData = await this.redis.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);
        } catch {}

        const rows = await this.prisma.aggregatedMetric.findMany({
            where: {
                organizationId: timeseriesDto.organizationId,
                period: timeseriesDto.period,
                periodStart: {
                    gte: bucketFrom,
                    lt: endExclusive
                }
            },
            select: {
                periodStart: true,
                apiKeyId: true,
                endpoint: true,
                totalRequests: true,
                errorCount: true,
                avgLatencyMs: true,
                p95LatencyMs: true,
                p99LatencyMs: true
            },
            orderBy: {
                periodStart: 'asc'
            }
        });

        type BucketPoint = {
            totalRequests: number;
            errorCount: number;
            errorRate: number;
            avgLatencyMs: number;
            p95LatencyMs: number;
            p99LatencyMs: number;
        };

        type BucketSeries = Record<string, BucketPoint>;

        const overviewData: BucketSeries = {};
        const endpointData: Record<string, BucketSeries> = {};
        const apiKeyData: Record<string, BucketSeries> = {};

        for (const row of rows) {
            const timestamp = row.periodStart.toISOString();
            const point: BucketPoint = {
                totalRequests: row.totalRequests,
                errorCount: row.errorCount,
                errorRate: row.totalRequests ? row.errorCount / row.totalRequests : 0,
                avgLatencyMs: row.avgLatencyMs,
                p95LatencyMs: row.p95LatencyMs,
                p99LatencyMs: row.p99LatencyMs
            };

            if (!row.apiKeyId && !row.endpoint) {
                overviewData[timestamp] = point;
            } else if (row.apiKeyId && !row.endpoint) {
                apiKeyData[row.apiKeyId] ??= {};
                apiKeyData[row.apiKeyId][timestamp] = point;
            } else if (!row.apiKeyId && row.endpoint) {
                endpointData[row.endpoint] ??= {};
                endpointData[row.endpoint][timestamp] = point;
            }
        }

        this.fillMissingBuckets(overviewData, bucketFrom, endExclusive, timeseriesDto.period);
        this.fillMissingBucketsForGroups(endpointData, bucketFrom, endExclusive, timeseriesDto.period);
        this.fillMissingBucketsForGroups(apiKeyData, bucketFrom, endExclusive, timeseriesDto.period);

        const data = {
            period: timeseriesDto.period,
            from,
            to,
            overview: this.seriesToPoints(overviewData),
            byEndpoint: this.groupedSeriesToPoints(endpointData),
            byApiKey: this.groupedSeriesToPoints(apiKeyData)
        };

        try {
            await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 60);
        } catch {}

        return data;

    }

    private addTime(curDate: Date, interval: AggPeriod) {
        switch(interval) {
            case AggPeriod.MINUTE:
                curDate.setUTCMinutes(curDate.getUTCMinutes() + 1);
                break
            case AggPeriod.HOUR:
                curDate.setUTCHours(curDate.getUTCHours() + 1);
                break
            case AggPeriod.DAY:
                curDate.setUTCDate(curDate.getUTCDate() + 1);
                break
        }
    }

    private floorToBucket(date: Date, interval: AggPeriod): Date {
        const result = new Date(date);
        result.setUTCSeconds(0, 0);
        if (interval === AggPeriod.HOUR || interval === AggPeriod.DAY) {
            result.setUTCMinutes(0, 0, 0);
        }
        if (interval === AggPeriod.DAY) {
            result.setUTCHours(0, 0, 0, 0);
        }
        return result;
    }

    private nextBucket(date: Date, interval: AggPeriod): Date {
        const result = new Date(date);
        this.addTime(result, interval);
        return result;
    }

    private zeroBucketPoint() {
        return {
            totalRequests: 0,
            errorCount: 0,
            errorRate: 0,
            avgLatencyMs: 0,
            p95LatencyMs: 0,
            p99LatencyMs: 0
        };
    }

    private fillMissingBuckets(
        series: Record<string, ReturnType<AnalyticsService['zeroBucketPoint']>>,
        from: Date,
        to: Date,
        period: AggPeriod
    ) {
        for (let cur = new Date(from); cur < to; this.addTime(cur, period)) {
            const key = cur.toISOString();
            if (!series[key]) {
                series[key] = this.zeroBucketPoint();
            }
        }
    }

    private fillMissingBucketsForGroups(
        groupedSeries: Record<string, Record<string, ReturnType<AnalyticsService['zeroBucketPoint']>>>,
        from: Date,
        to: Date,
        period: AggPeriod
    ) {
        for (const groupKey of Object.keys(groupedSeries)) {
            this.fillMissingBuckets(groupedSeries[groupKey], from, to, period);
        }
    }

    private seriesToPoints(
        series: Record<string, ReturnType<AnalyticsService['zeroBucketPoint']>>
    ) {
        return Object.entries(series)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([timestamp, point]) => ({
                timestamp,
                ...point
            }));
    }

    private groupedSeriesToPoints(
        groupedSeries: Record<string, Record<string, ReturnType<AnalyticsService['zeroBucketPoint']>>>
    ) {
        return Object.fromEntries(
            Object.entries(groupedSeries).map(([groupKey, series]) => [
                groupKey,
                this.seriesToPoints(series)
            ])
        );
    }

    private async checkPermissions(userId: string, organizationId: string) {
        const user = await this.prisma.user.findUnique(
            {
                where: {
                    id: userId
                }
            }
        );
        if (!user) throw new ForbiddenException('Permission denied');
        const orgCheck = await this.prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });
        if (!orgCheck) throw new ForbiddenException('Permission denied');
    }


}
