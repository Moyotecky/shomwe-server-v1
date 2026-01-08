import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const globalPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  app.setGlobalPrefix(globalPrefix);

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  console.log(`Listening on port ${port} with prefix /${globalPrefix}`);
}
bootstrap();
