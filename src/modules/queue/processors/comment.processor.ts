import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ObjectID } from '@utils/mongodb.util';
import { QUEUE_CONSTANTS } from '../queue.constants';
import { getPrefixedQueueName } from '@utils/env.util';
import { CommentService } from 'src/modules/comment/comment.service';
import { CacheService } from 'src/modules/cache/cache.service';

@Injectable()
export class CommentProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    private readonly commentService: CommentService,
    private readonly cacheService: CacheService,
  ) {}

  async onModuleInit() {
    const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.COMMENT_QUEUE);

    this.worker = new Worker(
      queueName,
      async (job: Job): Promise<any> => {
        const { commentId } = job.data;
        const jobData = job.data;

        if (job.name === 'add') {
          const data = await this.commentService.create(jobData);
          this.commentService.updateCommentDataInRedis(data, jobData.commentId);
        } else if (job.name === 'update') {
          await this.commentService.findByIdAndUpdate(
            ObjectID(commentId),
            {
              comment: jobData.comment,
            },
            { _id: 1 },
          );
        } else if (job.name === 'delete') {
          await this.commentService.deleteMany({
            $or: [{ _id: ObjectID(commentId) }, { parentId: commentId }],
          });
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
