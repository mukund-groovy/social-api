import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());

  const configService = app.get(ConfigService); // 💉 inject ConfigService
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
}
bootstrap();
