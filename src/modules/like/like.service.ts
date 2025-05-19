import { Injectable } from '@nestjs/common';
import { LikeUnlikeDto } from './dto/like-unlike.dto';
import { messages } from 'src/message.config';
import { LikeQueue } from './like.queue';
import { LikeDAO } from './like.dao';
import { ObjectID } from '@utils/mongodb.util';
import { UserLikeDto } from './dto/user-like.dto';
import { CommonService } from '../common/common.service';
import { LikeDocument } from './entities/like.entity';
import { CacheService } from '../cache/cache.service';
import { convertToString } from '@utils/lodash.util';

@Injectable()
export class LikeService extends CommonService<LikeDocument> {
  constructor(
    private readonly likeQueue: LikeQueue,
    private readonly likeDAO: LikeDAO,
    private readonly cacheService: CacheService,
  ) {
    super(likeDAO);
  }

  /**
   * API for like post
   * @param likeDto
   * @returns
   */
  async likePost(likeDto: LikeUnlikeDto): Promise<{ message: string }> {
    const user = await this.getCurrentUser();
    const userId = convertToString(user.userId);

    await this.cacheService.incr(`post:${likeDto.postId}:likes`);
    await this.cacheService.sadd(`post:${likeDto.postId}:likers`, userId);

    const insertData = { userId, postId: likeDto.postId };

    await this.likeQueue.enqueueLike(insertData);
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
    const user = await this.getCurrentUser();
    const userId = convertToString(user.userId);

    await this.cacheService.decr(`post:${unlikeDto.postId}:likes`);
    await this.cacheService.srem(`post:${unlikeDto.postId}:likers`, userId);

    const insertData = { userId, postId: unlikeDto.postId };
    await this.likeQueue.enqueueUnlike(insertData);
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
}
