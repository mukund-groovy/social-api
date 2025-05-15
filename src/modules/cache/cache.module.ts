// cache.module.ts
import { Module, Global, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { CacheService } from './cache.service';
import { PostModule } from '../post/post.module';
import { UserModule } from 'src/modules/user/user.module';

@Global()
@Module({
  imports: [
    ConfigModule,

    // BullMQ global setup (connection config only)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: Number(configService.get('REDIS_PORT')) || 6379,
          db: Number(configService.get('REDIS_DB')) || 0,
        },
      }),
    }),

    PostModule,
    forwardRef(() => UserModule),
  ],

  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST') || 'localhost',
          port: Number(configService.get('REDIS_PORT')) || 6379,
          db: Number(configService.get('REDIS_DB')) || 0,
        });
      },
      inject: [ConfigService],
    },
    CacheService,
  ],

  exports: [CacheService],
})
export class CacheModule {}
