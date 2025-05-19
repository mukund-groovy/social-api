// like.processor.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { getPrefixedQueueName } from '@utils/env.util';
import { Worker, Job } from 'bullmq';
import { QUEUE_CONSTANTS } from '../queue.constants';
import { LikeService } from 'src/modules/like/like.service';
import Redis from 'ioredis';

@Injectable()
export class LikeProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    private readonly likeService: LikeService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  onModuleInit() {
    const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.LIKE_QUEUE);

    this.worker = new Worker(
      queueName,
      async (job: Job<{ userId: string; postId: string }>) => {
        const { userId, postId } = job.data;

        if (job.name === 'like') {
          const hasLiked = await this.likeService.findOne(userId, postId);
          if (!hasLiked) {
            await this.likeService.updateOne(userId, postId);
          }
        } else if (job.name === 'unlike') {
          await this.likeService.findOneAndDelete(userId, postId);
        } else {
          throw new Error(`Unknown job type: ${job.name}`);
        }
      },
      {
        connection: this.redisClient,
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
