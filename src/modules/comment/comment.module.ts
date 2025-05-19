import { forwardRef, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './entities/comment.entity';
import { QueueModule } from '../queue/queue.module';
import { CommentDAO } from './comment.dao';
import { PostModule } from '../post/post.module';
import { CommentQueue } from './comment.queue';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    forwardRef(() => QueueModule),
    forwardRef(() => PostModule),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentDAO, CommentQueue],
  exports: [CommentService],
})
export class CommentModule {}
