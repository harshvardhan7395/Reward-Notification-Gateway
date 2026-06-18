import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenVerifier } from './token-verifier';

@Injectable()
export class JwtTokenVerifier implements TokenVerifier {
  constructor(private readonly jwtService: JwtService) {}

  async verify(token: string): Promise<{ sub: string }> {
    return this.jwtService.verifyAsync<{ sub: string }>(token);
  }
}
