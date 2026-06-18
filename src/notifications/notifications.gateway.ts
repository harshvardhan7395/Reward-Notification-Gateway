import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TOKEN_VERIFIER, TokenVerifier } from '../auth/token-verifier';
import { NotificationsService } from './notifications.service';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(TOKEN_VERIFIER) private readonly tokenVerifier: TokenVerifier,
    private readonly notificationsService: NotificationsService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit(): void {
    this.redisService.onReward((event) => {
      this.notificationsService.sendReward(event.userId, {
        amount: event.amount,
        description: event.description,
        timestamp: event.timestamp,
      });
    });
  }

  async handleConnection(client: Socket): Promise<void> {
    const token: string | undefined = client.handshake?.auth?.token;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.tokenVerifier.verify(token);
      client.data.userId = payload.sub;
      this.notificationsService.register(client.data.userId, client);
      client.emit('connected', { userId: client.data.userId });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    if (client.data.userId) {
      this.notificationsService.deregister(client.data.userId);
    }
  }
}