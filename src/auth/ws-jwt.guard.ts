import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { TOKEN_VERIFIER, TokenVerifier } from './token-verifier';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(@Inject(TOKEN_VERIFIER) private readonly tokenVerifier: TokenVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token: string | undefined = client.handshake?.auth?.token;

    if (!token) return false;

    try {
      const payload = await this.tokenVerifier.verify(token);
      client.data.userId = payload.sub;
      return true;
    } catch {
      return false;
    }
  }
}
