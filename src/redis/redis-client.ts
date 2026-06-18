export interface RedisPubClient {
  publish(channel: string, message: string): Promise<number>;
  quit(): Promise<string>;
}

export interface RedisSubClient {
  subscribe(channel: string): Promise<unknown>;
  on(event: 'message', listener: (channel: string, message: string) => void): void;
  quit(): Promise<string>;
}