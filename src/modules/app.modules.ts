// src/modules/app.modules.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CacheModule } from './cache/cache.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
import { MediaModule } from './media/media.module';
// Add more feature modules here

@Module({
  imports: [
    UserModule,
    PostModule,
    CacheModule,
    LikeModule,
    CommentModule,
    MediaModule,

    // Include all the modules you want
  ],
})
export class AppModules {}
