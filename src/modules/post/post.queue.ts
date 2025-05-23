// likes.queue.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUE_CONSTANTS } from '../queue/queue.constants';
import { PostJobData } from '../queue/job.interfaces';

@Injectable()
export class PostQueue {
  constructor(
    @InjectQueue(QUEUE_CONSTANTS.POST_QUEUE) private readonly postQueue: Queue,
  ) {}

  async addPostJob(data: PostJobData) {
    await this.postQueue.add('post', data); // Adds a job to the queue
  }
}
