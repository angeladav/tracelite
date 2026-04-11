import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_KEYS } from '@tracelite/common'

@Injectable()
export class QueueService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) { }

    async enqueue(event) {
        try {
            return await this.redis.xadd(REDIS_KEYS.STREAM_EVENTS, '*', 'payload', JSON.stringify(event))
        } catch { }

        try {
            return await this.redis.lpush(
                REDIS_KEYS.FALLBACK_EVENTS,
                JSON.stringify(event),
            );
        } catch { }

        return null;
    }

}
