import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaService } from '@tracelite/db';

/** Must match `QueueService` in services/api (`XADD` stream key). */
const STREAM_KEY = 'tracelite:events';

/** Consumer group: shared by all worker processes reading this stream. */
const GROUP_NAME = 'tracelite-workers';

/** Fallback buffer list when stream enqueue fails (see API `QueueService`). */
const FALLBACK_LIST_KEY = 'tracelite:fallback:events';

const STREAM_BLOCK_MS = 5000;
const STREAM_BATCH = 50;
const FALLBACK_BLPOP_SEC = 5;

type QueuedTrackEvent = {
  apiKeyId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  idempotencyKey?: string;
  metadata?: Prisma.InputJsonValue;
  userAgent?: string;
  ipAddress?: string;
};

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);

  /** Stops background loops when Nest shuts down. */
  private stopRequested = false;

  /** Unique name for this process in the Redis consumer group. */
  private readonly consumerId = `worker-${process.pid}`;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<{ status: string; db: string; redis: string }> {
    let db: 'connected' | 'disconnected' = 'disconnected';
    let redis: 'connected' | 'disconnected' = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'connected';
    } catch {
      /* leave disconnected */
    }

    try {
      const pong = await this.redis.ping();
      if (pong === 'PONG') {
        redis = 'connected';
      }
    } catch {
      /* leave disconnected */
    }

    if (db === 'connected' && redis === 'connected') {
      return { status: 'ok', db, redis };
    }

    throw new ServiceUnavailableException({
      status: 'error',
      db,
      redis,
    });
  }

  /** Create the Redis consumer group once; safe if it already exists. */
  private async ensureConsumerGroup(): Promise<void> {
    try {
      await this.redis.xgroup(
        'CREATE',
        STREAM_KEY,
        GROUP_NAME,
        '0',
        'MKSTREAM',
      );
      this.logger.log(`Created consumer group "${GROUP_NAME}" on ${STREAM_KEY}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('BUSYGROUP')) {
        throw err;
      }
    }
  }

  private async readStreamBatch(): Promise<
    [string, [string, string[]][]][] | null
  > {
    const reply = (await this.redis.xreadgroup(
      'GROUP',
      GROUP_NAME,
      this.consumerId,
      'COUNT',
      String(STREAM_BATCH),
      'BLOCK',
      String(STREAM_BLOCK_MS),
      'STREAMS',
      STREAM_KEY,
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
        apiKeyId: event.apiKeyId,
        method: event.method,
        endpoint: event.endpoint,
        statusCode: event.statusCode,
        latencyMs: event.latencyMs,
        idempotencyKey: event.idempotencyKey,
        metadata: event.metadata,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress,
      },
    });
  }

  private async handleStreamMessage(
    messageId: string,
    fields: string[],
  ): Promise<void> {
    const event = this.parsePayload(fields);
    if (!event?.apiKeyId) {
      this.logger.warn(`Bad payload for ${messageId}, ACKing to drop`);
      await this.redis.xack(STREAM_KEY, GROUP_NAME, messageId);
      return;
    }

    const persist = await this.shouldPersist(event);
    if (persist) {
      try {
        await this.persistEvent(event);
      } catch (err: unknown) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          this.logger.debug(
            `Duplicate idempotencyKey (race) for ${event.idempotencyKey}, ACKing`,
          );
        } else {
          throw err;
        }
      }
    }

    await this.redis.xack(STREAM_KEY, GROUP_NAME, messageId);
  }

  private async runStreamConsumer(): Promise<void> {
    while (!this.stopRequested) {
      console.log('here')
      try {
        const reply = await this.readStreamBatch();
        if (!reply) {
          continue;
        }
        for (const [, messages] of reply) {
          if (!messages) {
            continue;
          }
          for (const [id, fields] of messages) {
            await this.handleStreamMessage(id, fields);
          }
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

  private async runFallbackDrainer(): Promise<void> {
    while (!this.stopRequested) {
      try {
        const popped = await this.redis.blpop(
          FALLBACK_LIST_KEY,
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

  async onModuleInit(): Promise<void> {
    await this.ensureConsumerGroup();
    void this.runStreamConsumer();
    void this.runFallbackDrainer();
  }

  onModuleDestroy(): void {
    this.stopRequested = true;
  }
}
