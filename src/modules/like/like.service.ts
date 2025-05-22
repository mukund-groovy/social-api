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
import { UserService } from '../user/user.service';

@Injectable()
export class LikeService extends CommonService<LikeDocument> {
  constructor(
    private readonly likeQueue: LikeQueue,
    private readonly likeDAO: LikeDAO,
    private readonly cacheService: CacheService,
    private readonly userService: UserService,
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
    await this.cacheService.zadd(
      `post:${likeDto.postId}:likers`,
      Date.now(),
      userId,
    );

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
    await this.cacheService.zrem(`post:${unlikeDto.postId}:likers`, userId);

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
    let userIds: string[];
    const limit = userLikeDto?.perPage || 10;
    if (!userLikeDto.lastId) {
      // First page
      userIds = await this.cacheService.zrange(
        `post:${postId}:likers`,
        limit - 1,
      );
    } else {
      // Get score of the last user
      const lastScore = await this.cacheService.zscore(
        `post:${postId}:likers`,
        convertToString(userLikeDto.lastId),
      );
      if (!lastScore) return { users: [], nextCursor: null };

      // Next page after lastScore
      userIds = await this.cacheService.zrangebyscore(
        `post:${postId}:likers`,
        `(${lastScore}`, // exclusive range
        '+inf',
        'LIMIT',
        0,
        limit,
      );
    }

    if (userIds.length === 0) return { users: [], nextCursor: null };

    // Fetch user data from MongoDB
    const userFilter = {
      userId: { $in: userIds.map((id) => ObjectID(id)) },
    };
    const users = await this.userService.findAll(userFilter, {
      _id: 1,
      userId: 1,
      user_name: {
        $concat: [
          { $ifNull: ['$firstName', ''] },
          ' ',
          { $ifNull: ['$lastName', ''] },
        ],
      },
      display_name: {
        $ifNull: [
          '$displayName',
          {
            $concat: [
              { $ifNull: ['$firstName', ''] },
              ' ',
              { $ifNull: ['$lastName', ''] },
            ],
          },
        ],
      },
    });

    // Map for fast lookup
    const userMap = new Map(
      users.map((user) => [convertToString(user.userId), user]),
    );

    // Reorder
    const orderedUsers = userIds.map((id) => userMap.get(id)).filter(Boolean);

    return {
      users: orderedUsers,
      nextCursor: userIds[userIds.length - 1], // for next call
    };
  }
}
