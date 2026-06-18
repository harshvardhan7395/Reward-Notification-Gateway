import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService, REDIS_PUB, REDIS_SUB } from './redis.service';

const redisConfig = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

@Module({
  providers: [
    { provide: REDIS_PUB, useFactory: () => new Redis(redisConfig()) },
    { provide: REDIS_SUB, useFactory: () => new Redis(redisConfig()) },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
