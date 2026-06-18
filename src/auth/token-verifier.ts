export const TOKEN_VERIFIER = 'TOKEN_VERIFIER';

export interface TokenVerifier {
  verify(token: string): Promise<{ sub: string }>;
}