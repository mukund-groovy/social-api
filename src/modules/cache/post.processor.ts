// queue.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUE_CONSTANTS } from './cache.constants';
import { PostService } from '../post/post.service';

@Processor(QUEUE_CONSTANTS.POST_QUEUE)
export class PostProcessor {
  constructor(private readonly postService: PostService) {}
  @Process({ name: 'post', concurrency: 5 })
  async handleProcessJob(job: Job) {
    const data = job.data;
    const dataType = data.type;
    delete data.type;
    // Implement your processing logic here
    if (dataType === 'create') {
      await this.createPost(data);
    } else if (dataType === 'update') {
      const id = data.postId;
      delete data.postId;
      await this.updatePost(id, data);
    } else if (dataType === 'delete') {
      const id = data.postId;
      await this.deletePost(id);
    }
  }

  async createPost(data) {
    await this.postService.create(data);
    //TODO: upload file
    return {
      success: true,
    };
  }

  async updatePost(id, data) {
    await this.postService.findByIdAndUpdate(id, data);
    //TODO: upload file
    return {
      success: true,
    };
  }

  async deletePost(id) {
    await this.postService.findByIdAndDelete(id);
    //TODO: upload file
    return {
      success: true,
    };
  }
}
