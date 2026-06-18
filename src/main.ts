import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
  console.log('Reward Notification Gateway running on http://localhost:3000');
  console.log('Demo: http://localhost:3000/demo.html');
}

bootstrap();