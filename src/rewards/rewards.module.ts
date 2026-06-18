import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [RewardsController],
})
export class RewardsModule {}