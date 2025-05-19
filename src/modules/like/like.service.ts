import { Injectable } from '@nestjs/common';
import { LikeUnlikeDto } from './dto/like-unlike.dto';
import { messages } from 'src/message.config';
import { LikeQueue } from './like.queue';
import { LikeDAO } from './like.dao';
import { ObjectID } from '@utils/mongodb.util';
import { UserLikeDto } from './dto/user-like.dto';
import { ContextService } from 'src/common/context/context.service';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeQueue: LikeQueue,
    private readonly likeDAO: LikeDAO,
    private readonly context: ContextService,
  ) {}

  /**
   * API for like post
   * @param likeDto
   * @returns
   */
  async likePost(likeDto: LikeUnlikeDto): Promise<{ message: string }> {
    await this.likeQueue.enqueueLike(likeDto);
    return {
      message: messages.POST_LIKED,
    };
  }

  /**
   * API for unlike post
   * @param unlikeDto
   * @returns
   */
  async unlikePost(unlikeDto: LikeUnlikeDto): Promise<{ message: string }> {
    await this.likeQueue.enqueueUnlike(unlikeDto);
    return {
      message: messages.POST_UNLIKED,
    };
  }

  /**
   * API for post likes user list
   * @param id
   * @param param
   * @returns
   */
  async likeUserList(postId: string, userLikeDto: UserLikeDto) {
    const query: any = { postId: ObjectID(postId) };

    if (userLikeDto.lastId) {
      query._id = { $gt: userLikeDto.lastId }; // fetch after last_id
    }

    const criteria: any = {
      match: query,
      limit: userLikeDto?.perPage,
    };

    const result = await this.likeDAO.getLikeUserList(criteria);
    return {
      users: result,
      last_id: result.length ? result[result.length - 1]._id : null,
    };
  }

  async findOne(userId: string, postId: string) {
    return await this.likeDAO.findOne({ userId, postId });
  }

  async updateOne(userId: string, postId: string) {
    return await this.likeDAO.updateOne(
      { userId, postId },
      { $setOnInsert: { userId, postId } },
      { upsert: true },
    );
  }

  async findOneAndDelete(userId: string, postId: string) {
    return await this.likeDAO.findOneAndDelete({ userId, postId });
  }
}
