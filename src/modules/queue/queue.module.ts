// queue.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PostProcessor } from '../queue/processors/post.processor';
import { QUEUE_CONSTANTS } from '../cache/cache.constants';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    ConfigModule,

    // Register the post queue here
    BullModule.registerQueueAsync({
      name: QUEUE_CONSTANTS.POST_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
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
    }),
    forwardRef(() => PostModule),
  ],

  providers: [PostProcessor],
  exports: [BullModule], // export BullModule so queues can be injected in other modules
})
export class QueueModule {}
