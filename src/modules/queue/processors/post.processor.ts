import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { QUEUE_CONSTANTS } from '../queue.constants';
import { PostService } from '../../post/post.service';
import Redis from 'ioredis';
import { Worker, Job } from 'bullmq';

import { getPrefixedQueueName } from '@utils/env.util';

@Injectable()
export class PostProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    private readonly postService: PostService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // This is the main processor method
  onModuleInit() {
    const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.POST_QUEUE);

    this.worker = new Worker(
      queueName,
      async (job: Job): Promise<any> => {
        const data = job.data;
        const dataType = data.type;
        delete data.type;

        if (dataType === 'create') {
          return this.createPost(data);
        } else if (dataType === 'update') {
          const id = data.postId;
          delete data.postId;
          return this.updatePost(id, data);
        } else if (dataType === 'delete') {
          const id = data.postId;
          return this.deletePost(id);
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

  private async createPost(data: any) {
    await this.postService.create(data);
    // TODO: upload file
    return { success: true };
  }

  private async updatePost(id: string, data: any) {
    await this.postService.findByIdAndUpdate(id, data);
    // TODO: upload file
    return { success: true };
  }

  private async deletePost(id: string) {
    await this.postService.findByIdAndDelete(id);
    // TODO: delete file
    return { success: true };
  }
}
