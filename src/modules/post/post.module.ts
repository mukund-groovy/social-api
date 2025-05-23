import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './entities/post.entity';
import { PostDAO } from './post.dao';
import { PostQueue } from './post.queue';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    QueueModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostDAO, PostQueue],
  exports: [PostService],
})
export class PostModule {}
