import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisPubClient, RedisSubClient } from './redis-client';
import { RewardPayload } from '../notifications/notifications.service';

export const REDIS_PUB = 'REDIS_PUB';
export const REDIS_SUB = 'REDIS_SUB';
export const REDIS_CHANNEL = 'rewards';

export interface RewardEvent extends RewardPayload {
  userId: string;
}

type RewardListener = (event: RewardEvent) => void;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly listeners: RewardListener[] = [];

  constructor(
    @Inject(REDIS_PUB) private readonly pub: RedisPubClient,
    @Inject(REDIS_SUB) private readonly sub: RedisSubClient,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.sub.subscribe(REDIS_CHANNEL);
    this.sub.on('message', (_channel: string, message: string) => {
      try {
        const event: RewardEvent = JSON.parse(message);
        this.listeners.forEach((l) => l(event));
      } catch {
        // malformed message — skip
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pub.quit();
    await this.sub.quit();
  }

  async publishReward(event: RewardEvent): Promise<void> {
    await this.pub.publish(REDIS_CHANNEL, JSON.stringify(event));
  }

  onReward(listener: RewardListener): void {
    this.listeners.push(listener);
  }
}
