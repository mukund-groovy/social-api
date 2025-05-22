// like.processor.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getPrefixedQueueName } from '@utils/env.util';
import { Worker, Job } from 'bullmq';
import { QUEUE_CONSTANTS } from '../queue.constants';
import { LikeService } from 'src/modules/like/like.service';
import { CacheService } from 'src/modules/cache/cache.service';

@Injectable()
export class LikeProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    private readonly likeService: LikeService,
    private readonly cacheService: CacheService,
  ) {}

  async onModuleInit() {
    const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.LIKE_QUEUE);

    this.worker = new Worker(
      queueName,
      async (job: Job<{ userId: string; postId: string }>) => {
        const { userId, postId } = job.data;

        if (job.name === 'like') {
          const hasLiked = await this.cacheService.zrank(
            `post:${postId}:likers`,
            userId,
          );
          if (hasLiked == null) return;
          await this.likeService.updateOne(
            { userId, postId },
            { $setOnInsert: { userId, postId } },
            { upsert: true },
          );
        } else if (job.name === 'unlike') {
          const stillLiked = await this.cacheService.zrank(
            `post:${postId}:likers`,
            userId,
          );
          if (stillLiked !== null) return;
          await this.likeService.findOneAndDelete({ userId, postId });
        } else {
          throw new Error(`Unknown job type: ${job.name}`);
        }
      },
      {
        connection: await this.cacheService.getRedis(),
      },
    );

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.name} failed`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Worker error:', err);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
