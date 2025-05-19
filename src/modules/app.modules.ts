// src/modules/app.modules.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CacheModule } from './cache/cache.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
// Add more feature modules here

@Module({
  imports: [
    UserModule,
    PostModule,
    CacheModule,
    LikeModule,
    CommentModule,

    // Include all the modules you want
  ],
})
export class AppModules {}
