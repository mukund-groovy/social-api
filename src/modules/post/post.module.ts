import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './entities/post.schema';
import { PostDAO } from './post.dao';
import { PostComment, PostCommentSchema } from './entities/post-comment.entity';
import { PostCommentDAO } from './comment.dao';
import { PostQueue } from './post.queue';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostComment.name, schema: PostCommentSchema },
    ]),
    QueueModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostDAO, PostCommentDAO, PostQueue],
  exports: [PostService],
})
export class PostModule {}
