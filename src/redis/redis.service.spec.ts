import { Test } from '@nestjs/testing';
import { RedisPubClient, RedisSubClient } from './redis-client';
import { RedisService, REDIS_PUB, REDIS_SUB } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let mockPub: jest.Mocked<RedisPubClient>;
  let mockSub: jest.Mocked<RedisSubClient>;

  beforeEach(async () => {
    mockPub = { publish: jest.fn().mockResolvedValue(1), quit: jest.fn().mockResolvedValue('OK') };
    mockSub = {
      subscribe: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
    };

    const module = await Test.createTestingModule({
      providers: [
        { provide: REDIS_PUB, useValue: mockPub },
        { provide: REDIS_SUB, useValue: mockSub },
        RedisService,
      ],
    }).compile();

    service = module.get(RedisService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should publish a reward event to the rewards channel', async () => {
    const payload = { userId: 'u1', amount: 50, description: 'Survey complete' };
    await service.publishReward(payload);
    expect(mockPub.publish).toHaveBeenCalledWith('rewards', JSON.stringify(payload));
  });

  it('should call registered listeners when a message is received', () => {
    const listener = jest.fn();
    service.onReward(listener);

    const messageHandler = mockSub.on.mock.calls[0]?.[1];

    const payload = { userId: 'u1', amount: 50, description: 'Survey complete' };
    messageHandler?.('rewards', JSON.stringify(payload));

    expect(listener).toHaveBeenCalledWith(payload);
  });

  it('should not throw when receiving malformed JSON', () => {
    const messageHandler = mockSub.on.mock.calls[0]?.[1];
    expect(() => messageHandler?.('rewards', 'not-json')).not.toThrow();
  });
});
