import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './entities/post.schema';
import { PostDAO } from './post.dao';
import { PostComment, PostCommentSchema } from './entities/post-comment.entity';
import { PostLike, PostLikeSchema } from './entities/post-like.entity';
import { PostCommentDAO } from './comment.dao';
import { PostLikeDAO } from './like.dao';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostComment.name, schema: PostCommentSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, PostDAO, PostCommentDAO, PostLikeDAO],
  exports: [PostService],
})
export class PostModule {}
