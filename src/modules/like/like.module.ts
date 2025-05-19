import { forwardRef, Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './entities/like.entity';
import { LikeDAO } from './like.dao';
import { LikeQueue } from './like.queue';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    forwardRef(() => QueueModule),
  ],
  controllers: [LikeController],
  providers: [LikeService, LikeDAO, LikeQueue],
  exports: [LikeService],
})
export class LikeModule {}
