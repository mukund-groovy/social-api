import Redis from 'ioredis';
import { BullModule } from '@nestjs/bull';
import { CacheService } from './cache.service';
import { PostProcessor } from './post.processor';
import { PostModule } from '../post/post.module';
import { Module, Global, forwardRef } from '@nestjs/common';
import { UserModule } from 'src/modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_CONSTANTS } from './cache.constants';

let redisConfig;

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async (configService: ConfigService) => {
    redisConfig = {
      host: configService.get('REDIS_HOST') || 'localhost', //process.env.REDIS_HOST,
      port: configService.get('REDIS_PORT') || 10,
      // username: process.env.REDIS_USERNAME,
      // password: process.env.REDIS_PASSWORD,
      db: configService.get('REDIS_DB') || 10,
    };
    const client = new Redis(redisConfig);
    return client;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      redis: redisConfig,
    }),
    BullModule.registerQueueAsync({
      name: QUEUE_CONSTANTS.POST_QUEUE,
      useFactory: async (configService: ConfigService) => {
        const prefix = configService.get<string>('REDIS_PREFIX') || 'DEV';
        return {
          name: `${prefix}${QUEUE_CONSTANTS.POST_QUEUE}`,
          defaultJobOptions: {
            removeOnComplete: false,
            removeOnFail: false,
          },
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    PostModule,
    forwardRef(() => UserModule),
  ],
  providers: [redisProvider, CacheService, PostProcessor],
  exports: [CacheService],
})
export class CacheModule {}
