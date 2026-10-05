import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL');

        if (redisUrl) {

            this.client = new Redis(redisUrl);

        }

        this.client.on('connect', () => {
            console.log(' Connected to Redis successfully');
        });

        this.client.on('error', (err) => {
            console.error(' Redis Connection Error:', err);
        });
    }

    onModuleDestroy() {
        this.client?.disconnect();
    }


    async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
        if (ttlSeconds) {
            return this.client.set(key, value, 'EX', ttlSeconds);
        }
        return this.client.set(key, value);
    }


    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }


    async del(key: string): Promise<number> {
        return this.client.del(key);
    }
}
