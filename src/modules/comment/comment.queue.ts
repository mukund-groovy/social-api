import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_CONSTANTS } from '../queue/queue.constants';

@Injectable()
export class CommentQueue {
  constructor(
    @InjectQueue(QUEUE_CONSTANTS.COMMENT_QUEUE)
    private readonly commentQueue: Queue,
  ) {}

  async addComment(addData) {
    await this.commentQueue.add('add', addData);
  }

  async updateComment(addData) {
    await this.commentQueue.add('update', addData);
  }

  async deleteComment(addData) {
    await this.commentQueue.add('delete', addData);
  }
}
