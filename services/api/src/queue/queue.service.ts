import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class QueueService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) { }

    async enqueue(event) {
        try {
            return await this.redis.xadd('tracelite:events', '*', 'payload', JSON.stringify(event))
        } catch { }

        try {
            return await this.redis.lpush(
                'tracelite:fallback:events',
                JSON.stringify(event),
            );
        } catch { }

        return null;
    }

}
