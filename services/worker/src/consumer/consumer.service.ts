import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaService } from '@tracelite/db';
import { REDIS_KEYS } from '@tracelite/common';

const GROUP_NAME = 'tracelite-workers';
const STREAM_BLOCK_MS = 5000;
const STREAM_BATCH = 50;
const FALLBACK_BLPOP_SEC = 5;

type QueuedTrackEvent = {
    id?: string;
    apiKeyId: string;
    method: string;
    endpoint: string;
    statusCode: number;
    latencyMs: number;
    idempotencyKey?: string;
    metadata?: Prisma.InputJsonValue;
    userAgent?: string;
    ipAddress?: string;
    organizationId: string;
};

@Injectable()
export class ConsumerService {
    private readonly logger = new Logger(ConsumerService.name);

    private stopRequested = false;

    private readonly consumerId = `worker-${process.pid}`;

    constructor(
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        private readonly prisma: PrismaService,
    ) {}

    stopWorker(): void {
        this.stopRequested = true;
    }

    async ensureConsumerGroup(): Promise<void> {
        try {
            await this.redis.xgroup(
                'CREATE',
                REDIS_KEYS.STREAM_EVENTS,
                GROUP_NAME,
                '0',
                'MKSTREAM',
            );
            this.logger.log(
                `Created consumer group "${GROUP_NAME}" on ${REDIS_KEYS.STREAM_EVENTS}`,
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!msg.includes('BUSYGROUP')) {
                throw err;
            }
        }
    }

    private async readStreamBatch(): Promise<[string, [string, string[]][]][] | null> {
        const reply = (await this.redis.xreadgroup(
            'GROUP',
            GROUP_NAME,
            this.consumerId,
            'COUNT',
            String(STREAM_BATCH),
            'BLOCK',
            String(STREAM_BLOCK_MS),
            'STREAMS',
            REDIS_KEYS.STREAM_EVENTS,
            '>',
        )) as [string, [string, string[]][]][] | null;
        return reply;
    }

    private parsePayload(fields: string[]): QueuedTrackEvent | null {
        const i = fields.indexOf('payload');
        if (i === -1 || i + 1 >= fields.length) {
            return null;
        }
        try {
            return JSON.parse(fields[i + 1]!) as QueuedTrackEvent;
        } catch {
            return null;
        }
    }

    private async shouldPersist(event: QueuedTrackEvent): Promise<boolean> {
        if (!event.idempotencyKey) {
            return true;
        }
        const existing = await this.prisma.requestLog.findUnique({
            where: { idempotencyKey: event.idempotencyKey },
        });
        return existing === null;
    }

    private async persistEvent(event: QueuedTrackEvent): Promise<void> {
        await this.prisma.requestLog.create({
            data: {
                ...(event.id ? { id: event.id } : {}),
                apiKeyId: event.apiKeyId,
                method: event.method,
                endpoint: event.endpoint,
                statusCode: event.statusCode,
                latencyMs: event.latencyMs,
                idempotencyKey: event.idempotencyKey,
                metadata: event.metadata,
                userAgent: event.userAgent,
                ipAddress: event.ipAddress,
                organizationId: event.organizationId,
            },
        });
    }

    private async handleStreamMessages(messages: [string, string[]][]): Promise<void> {
        type Entry = { messageId: string; event: QueuedTrackEvent };
        const entries: Entry[] = [];
        const badIds: string[] = [];

        for (const [messageId, fields] of messages) {
            const event = this.parsePayload(fields);
            if (!event?.apiKeyId || !event.organizationId) {
                badIds.push(messageId);
            } else {
                entries.push({ messageId, event });
            }
        }

        for (const id of badIds) {
            await this.redis.xack(REDIS_KEYS.STREAM_EVENTS, GROUP_NAME, id);
        }

        if (entries.length === 0) {
            return;
        }

        const withIdem = entries.filter((e) => e.event.idempotencyKey);
        const keys = [...new Set(withIdem.map((e) => e.event.idempotencyKey!))];
        let existingKeys = new Set<string>();
        if (keys.length > 0) {
            const existing = await this.prisma.requestLog.findMany({
                where: { idempotencyKey: { in: keys } },
                select: { idempotencyKey: true },
            });
            existingKeys = new Set(
                existing.map((r) => r.idempotencyKey).filter((k): k is string => k != null),
            );
        }

        const ackImmediately: string[] = [];
        const toInsert: Array<{ messageId: string; row: Prisma.RequestLogCreateManyInput }> = [];

        for (const { messageId, event } of entries) {
            if (event.idempotencyKey && existingKeys.has(event.idempotencyKey)) {
                ackImmediately.push(messageId);
                continue;
            }
            toInsert.push({
                messageId,
                row: {
                    ...(event.id ? { id: event.id } : {}),
                    apiKeyId: event.apiKeyId,
                    method: event.method,
                    endpoint: event.endpoint,
                    statusCode: event.statusCode,
                    latencyMs: event.latencyMs,
                    idempotencyKey: event.idempotencyKey,
                    metadata: event.metadata,
                    userAgent: event.userAgent,
                    ipAddress: event.ipAddress,
                    organizationId: event.organizationId,
                },
            });
        }

        for (const id of ackImmediately) {
            await this.redis.xack(REDIS_KEYS.STREAM_EVENTS, GROUP_NAME, id);
        }

        if (toInsert.length === 0) {
            return;
        }

        const rows = toInsert.map((t) => t.row);
        const messageIds = toInsert.map((t) => t.messageId);

        try {
            await this.prisma.requestLog.createMany({
                data: rows,
                skipDuplicates: true,
            });
        } catch (err: unknown) {
            this.logger.error(
                err instanceof Error ? err.stack : err,
                'Batch persist failed; messages will retry',
            );
            return;
        }

        for (const id of messageIds) {
            await this.redis.xack(REDIS_KEYS.STREAM_EVENTS, GROUP_NAME, id);
        }
    }

    async runStreamConsumer(): Promise<void> {
        while (!this.stopRequested) {
            try {
                const reply = await this.readStreamBatch();
                if (!reply) {
                    continue;
                }
                for (const [, streamMessages] of reply) {
                    if (!streamMessages) {
                        continue;
                    }
                    await this.handleStreamMessages(streamMessages);
                }
            } catch (err: unknown) {
                this.logger.error(
                    err instanceof Error ? err.stack : err,
                    'Stream consumer error',
                );
                await new Promise((r) => setTimeout(r, 1000));
            }
        }
    }

    async runFallbackDrainer(): Promise<void> {
        while (!this.stopRequested) {
            try {
                const popped = await this.redis.blpop(
                    REDIS_KEYS.FALLBACK_EVENTS,
                    FALLBACK_BLPOP_SEC,
                );
                if (!popped) {
                    continue;
                }
                const [, raw] = popped;
                let event: QueuedTrackEvent;
                try {
                    event = JSON.parse(raw) as QueuedTrackEvent;
                } catch {
                    this.logger.warn('Skipping non-JSON fallback list entry');
                    continue;
                }
                if (!event.apiKeyId || !event.organizationId) {
                    this.logger.warn(
                        'Skipping fallback event missing apiKeyId or organizationId',
                    );
                    continue;
                }
                if (!(await this.shouldPersist(event))) {
                    continue;
                }
                try {
                    await this.persistEvent(event);
                } catch (err: unknown) {
                    if (
                        err instanceof Prisma.PrismaClientKnownRequestError &&
                        err.code === 'P2002'
                    ) {
                        continue;
                    }
                    this.logger.error(
                        err instanceof Error ? err.stack : err,
                        'Fallback persist failed',
                    );
                }
            } catch (err: unknown) {
                this.logger.error(
                    err instanceof Error ? err.stack : err,
                    'Fallback drainer error',
                );
                await new Promise((r) => setTimeout(r, 1000));
            }
        }
    }
}
