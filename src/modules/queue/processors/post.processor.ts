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
import { FailedJobService } from 'src/modules/failed-job/failed-job.service';
import {
  CreatePostJobData,
  PostJobData,
  UpdatePostJobData,
} from '../job.interfaces';

@Injectable()
export class PostProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly postService: PostService,
    private readonly failedJobService: FailedJobService,
  ) {}

  onModuleInit() {
    const queueName = getPrefixedQueueName(QUEUE_CONSTANTS.POST_QUEUE);

    this.worker = new Worker<PostJobData>(
      queueName,
      async (job: Job<PostJobData>): Promise<any> => {
        const { type, ...payload } = job.data;

        try {
          switch (type) {
            case 'create':
              return await this.createPost(payload as CreatePostJobData);

            case 'update': {
              const id = payload.postId;
              if (!id) throw new Error('Missing postId for update');
              return await this.updatePost(id, payload as UpdatePostJobData);
            }

            case 'delete': {
              const id = payload.postId;
              if (!id) throw new Error('Missing postId for delete');
              return await this.deletePost(id);
            }

            default:
              throw new Error(`Unknown job type: ${type}`);
          }
        } catch (err) {
          console.error(`Job ${job.id} (${type}) processing error:`, err);
          throw err; // Let BullMQ handle retries if configured
        }
      },
      {
        connection: this.redisClient,
        concurrency: 5, // ✅ Set concurrency for better throughput
      },
    );

    // ✅ Use job.id and fallback if name is undefined
    this.worker.on('failed', async (job, err) => {
      console.error(
        `[${new Date().toISOString()}] ❌ Job ${job?.id ?? 'unknown'} failed`,
        err,
      );
      await this.logFailureToDatabase(job, err);
    });

    this.worker.on('error', async (err) => {
      console.error(`[${new Date().toISOString()}] 🔥 Worker error:`, err);
      await this.logFailureToDatabase(null, err);
    });
  }

  async onModuleDestroy() {
    try {
      await this.worker?.close();
    } catch (err) {
      console.error('Failed to cleanly shut down worker:', err);
    }
  }

  // ✅ Strongly typed and properly structured methods
  private async createPost(data: Omit<CreatePostJobData, 'type'>) {
    await this.postService.create(data);
    // TODO: Handle media upload if needed (separate service recommended)
    return { success: true };
  }

  private async updatePost(
    id: string,
    data: Omit<UpdatePostJobData, 'type' | 'postId'>,
  ) {
    await this.postService.findByIdAndUpdate(id, data);
    // TODO: Handle media update if needed
    return { success: true };
  }

  private async deletePost(id: string) {
    await this.postService.findByIdAndDelete(id);
    // TODO: Handle media deletion if needed
    return { success: true };
  }

  private async logFailureToDatabase(job: Job | null, error: Error) {
    try {
      if (job) {
        await this.failedJobService.logFailedJob(job, error);
        console.log(`📦 Logged failed job ${job.id} to DB`);
      } else {
        await this.failedJobService.logWorkerError(error);
        console.log(`🚨 Logged worker-level error to DB`);
      }
    } catch (loggingError) {
      console.error('⚠️ Failed to log to DB:', loggingError);
    }
  }
}
