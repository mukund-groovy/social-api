import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_CONSTANTS } from '../queue/queue.constants';

@Injectable()
export class LikeQueue {
  constructor(
    @InjectQueue(QUEUE_CONSTANTS.LIKE_QUEUE) private readonly likeQueue: Queue,
  ) {}

  async enqueueLike(addData: { userId: string; postId: string }) {
    await this.likeQueue.add('like', addData);
  }

  async enqueueUnlike(addData: { userId: string; postId: string }) {
    await this.likeQueue.add('unlike', addData);
  }
}
