import { Body, Controller, Post, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService, RewardEvent } from '../redis/redis.service';

@Controller('rewards')
export class RewardsController {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  /** Dev helper: generate a JWT for a userId so the demo page can connect */
  @Get('token')
  async getToken(@Query('userId') userId: string): Promise<{ token: string; userId: string }> {
    const token = await this.jwtService.signAsync({ sub: userId });
    return { token, userId };
  }

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async trigger(@Body() body: RewardEvent): Promise<RewardEvent> {
    const event: RewardEvent = {
      userId: body.userId,
      amount: body.amount,
      description: body.description,
      timestamp: new Date().toISOString(),
    };
    await this.redisService.publishReward(event);
    return event;
  }
}
