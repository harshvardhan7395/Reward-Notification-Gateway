import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { RedisModule } from '../redis/redis.module';
import { JwtTokenVerifier } from '../auth/jwt-token-verifier';
import { TOKEN_VERIFIER } from '../auth/token-verifier';

@Module({
  imports: [RedisModule],
  providers: [
    NotificationsGateway,
    NotificationsService,
    { provide: TOKEN_VERIFIER, useClass: JwtTokenVerifier },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
