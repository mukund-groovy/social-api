// queue.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PostProcessor } from '../queue/processors/post.processor';
import { QUEUE_CONSTANTS } from './queue.constants';
import { PostModule } from '../post/post.module';
import { LikeModule } from '../like/like.module';
import { LikeProcessor } from './processors/like.processor';
import { getPrefixedQueueName } from '@utils/env.util';
import { CommentModule } from '../comment/comment.module';
import { CommentProcessor } from './processors/comment.processor';
import { FailedJobModule } from '../failed-job/failed-job.module';

@Module({
  imports: [
    ConfigModule,
    FailedJobModule,
    // Register the post queue here
    BullModule.registerQueueAsync({
      name: QUEUE_CONSTANTS.POST_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => {
        const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.POST_QUEUE);
        return {
          name: queueName,
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
          },
        };
      },
    }),
    BullModule.registerQueueAsync({
      name: QUEUE_CONSTANTS.LIKE_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => {
        const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.LIKE_QUEUE);
        return {
          name: queueName,
          defaultJobOptions: {
            removeOnComplete: false,
            removeOnFail: false,
          },
        };
      },
    }),
    BullModule.registerQueueAsync({
      name: QUEUE_CONSTANTS.COMMENT_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => {
        const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.COMMENT_QUEUE);
        return {
          name: queueName,
          defaultJobOptions: {
            removeOnComplete: false,
            removeOnFail: false,
          },
        };
      },
    }),
    forwardRef(() => PostModule),
    LikeModule,
    CommentModule,
  ],

  providers: [PostProcessor, LikeProcessor, CommentProcessor],
  exports: [BullModule], // export BullModule so queues can be injected in other modules
})
export class QueueModule {}
