import { ExecutionContext } from '@nestjs/common';
import { TOKEN_VERIFIER, TokenVerifier } from './token-verifier';
import { WsJwtGuard } from './ws-jwt.guard';

const makeContext = (token?: string): ExecutionContext => {
  const client = { handshake: { auth: { token } }, data: {}, disconnect: jest.fn() };
  return { switchToWs: () => ({ getClient: () => client }) } as unknown as ExecutionContext;
};

class FakeTokenVerifier implements TokenVerifier {
  private result: { sub: string } | Error = new Error('not configured');

  resolve(payload: { sub: string }): void { this.result = payload; }
  reject(err: Error): void { this.result = err; }

  async verify(_token: string): Promise<{ sub: string }> {
    if (this.result instanceof Error) throw this.result;
    return this.result;
  }
}

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let verifier: FakeTokenVerifier;

  beforeEach(() => {
    verifier = new FakeTokenVerifier();
    guard = new WsJwtGuard(verifier);
  });

  it('should reject when no token is provided', async () => {
    const result = await guard.canActivate(makeContext(undefined));
    expect(result).toBe(false);
  });

  it('should reject when the token is invalid', async () => {
    verifier.reject(new Error('invalid'));
    const result = await guard.canActivate(makeContext('bad-token'));
    expect(result).toBe(false);
  });

  it('should accept and attach userId when the token is valid', async () => {
    verifier.resolve({ sub: 'user-42' });
    const ctx = makeContext('valid-token');
    const client = ctx.switchToWs().getClient();
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(client.data.userId).toBe('user-42');
  });
});
