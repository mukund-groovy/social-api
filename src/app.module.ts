import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setConfigService } from './config/env.util';
import { DatabaseModule } from './modules/database/database.module';
import { AppModules } from './modules/app.modules';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    AppModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(configService: ConfigService) {
    setConfigService(configService);
  }
}
