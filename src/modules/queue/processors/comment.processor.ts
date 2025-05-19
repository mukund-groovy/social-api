import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Worker, Job } from 'bullmq';
import { ObjectID } from '@utils/mongodb.util';
import { QUEUE_CONSTANTS } from '../queue.constants';
import { getPrefixedQueueName } from '@utils/env.util';
import { CommentService } from 'src/modules/comment/comment.service';

@Injectable()
export class CommentProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    private readonly commentService: CommentService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  onModuleInit() {
    const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.COMMENT_QUEUE);

    this.worker = new Worker(
      queueName,
      async (job: Job): Promise<any> => {
        const { postId } = job.data;
        const jobData = job.data;

        if (job.name === 'add') {
          await this.commentService.create(jobData);
        } else if (job.name === 'update') {
          await this.commentService.findByIdAndUpdate(postId, jobData);
        } else if (job.name === 'delete') {
          await this.commentService.updateMany(
            {
              $or: [{ _id: ObjectID(postId) }, { parentId: postId }],
            },
            {
              $set: {
                isDeleted: true,
              },
            },
          );
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
