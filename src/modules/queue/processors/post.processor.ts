// queue.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUE_CONSTANTS } from '../../cache/cache.constants';
import { PostService } from '../../post/post.service';

@Injectable()
@Processor(QUEUE_CONSTANTS.POST_QUEUE)
export class PostProcessor extends WorkerHost {
  constructor(private readonly postService: PostService) {
    super();
  }

  // This is the main processor method
  async process(job: Job): Promise<any> {
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
