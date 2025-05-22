import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setConfigService } from '@utils/env.util';
import { DatabaseModule } from './modules/database/database.module';
import { AppModules } from './modules/app.modules';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ErrorHandlingInterceptor } from './common/interceptor/error-handling.interceptor';
import { ContextInterceptor } from './common/context/context.interceptor';
import { ContextModule } from './common/context/context.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    AppModules,
    ContextModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorHandlingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInterceptor,
    },
  ],
})
export class AppModule {
  constructor(configService: ConfigService) {
    setConfigService(configService);
  }
}
