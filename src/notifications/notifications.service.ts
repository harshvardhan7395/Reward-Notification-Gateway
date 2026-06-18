import { Injectable } from '@nestjs/common';

export interface RewardPayload {
  amount: number;
  description: string;
  timestamp?: string;
}

export interface SocketClient {
  id: string;
  emit(event: string, payload: unknown): void;
}

@Injectable()
export class NotificationsService {
  private readonly sockets = new Map<string, SocketClient>();

  register(userId: string, socket: SocketClient): void {
    this.sockets.set(userId, socket);
  }

  deregister(userId: string): void {
    this.sockets.delete(userId);
  }

  getSocket(userId: string): SocketClient | undefined {
    return this.sockets.get(userId);
  }

  sendReward(userId: string, payload: RewardPayload): void {
    const socket = this.sockets.get(userId);
    if (socket) {
      socket.emit('reward', payload);
    }
  }

  get connectionCount(): number {
    return this.sockets.size;
  }
}
