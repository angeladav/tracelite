import Redis from 'ioredis';

export const RedisProvider = {
    provide: 'REDIS_CLIENT',
    useFactory: () => new Redis(
        {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT!) || 6379,
        }
    )
}