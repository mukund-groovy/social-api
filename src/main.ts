import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getEnv } from '@utils/env.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // This allows ALL origins

  const port = getEnv('PORT', 3000);
  const swaggerEnable = getEnv<string>('ENABLE_SWAGGER');

  if (swaggerEnable === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Social API')
      .setDescription('Saayam Social API List')
      .setVersion('1.0')
      .addBearerAuth(
        {
          // I was also testing it without prefix 'Bearer ' before the JWT
          description: `[just text field] Please enter token in following format: Bearer <JWT>`,
          name: 'Authorization',
          bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
          scheme: 'Bearer',
          type: 'http', // I`ve attempted type: 'apiKey' too
          in: 'Header',
        },
        'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port);
}
bootstrap();
