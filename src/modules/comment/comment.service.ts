import { Injectable, NotFoundException } from '@nestjs/common';
import { AddCommentDto } from './dto/create-comment.dto';
import { CommentDocument } from './entities/comment.entity';
import { CommentDAO } from './comment.dao';
import { PostService } from '../post/post.service';
import { messages } from 'src/message.config';
import { ObjectID } from '@utils/mongodb.util';
import { CommentQueue } from './comment.queue';
import { CommentListDto } from './dto/comment-list.dto';
import { isNotEmpty } from 'class-validator';
import { CommonService } from '../common/common.service';
import { CacheService } from '../cache/cache.service';
import { convertToString, isValidAndDefined } from '@utils/lodash.util';
import { randomUUID } from 'crypto';

@Injectable()
export class CommentService extends CommonService<CommentDocument> {
  constructor(
    private readonly postService: PostService,
    private readonly commentQueue: CommentQueue,
    private readonly commentDAO: CommentDAO,
    private readonly cacheService: CacheService,
  ) {
    super(commentDAO);
  }

  /**
   * API for create comment in post
   * @param AddCommentDto
   * @returns
   */
  public async addComment(
    addCommentDto: AddCommentDto,
  ): Promise<{ message: string; data: CommentDocument }> {
    const user = await this.getCurrentUser();
    const userId = convertToString(user.userId);

    const findPost = await this.postService.findOne({
      _id: ObjectID(addCommentDto.postId),
    });

    if (!findPost) {
      throw new NotFoundException(messages.POST_NOT_FOUND);
    }

    const createComment: any = {
      parentId: addCommentDto?.parentId,
      comment: addCommentDto.comment,
      postId: addCommentDto.postId,
      userId,
      commentId: randomUUID(),
    };
    const redisKey = `post:${addCommentDto.postId}:comments`;

    if (addCommentDto?.parentId) {
      //update comment reply in redis
      await this.updateCommentReplyDataInRedis(createComment);
    } else {
      // Add new comment to the start of the list
      await this.cacheService.lpush(redisKey, JSON.stringify(createComment));

      // Keep only the latest 10 comments (index 0 to 9)
      await this.cacheService.ltrim(redisKey, 0, 9);
    }

    await this.commentQueue.addComment(createComment);

    return {
      message: messages.COMMENT_ADDED,
      data: createComment,
    };
  }

  /**
   * API for update comment in post
   * @param id
   * @param comment
   * @returns
   */
  public async updateComment(
    id: string,
    comment: string,
  ): Promise<{ message: string; data: object }> {
    const findComment: any = await this.commentDAO.findOne({
      _id: ObjectID(id),
    });

    if (!findComment) {
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }
    const data = {
      commentId: id,
      comment: comment,
    };
    findComment.comment = comment;
    await this.updateCommentDataInRedis(findComment, id);
    await this.commentQueue.updateComment(data);

    return {
      message: messages.COMMENT_UPDATED,
      data: { comment },
    };
  }

  /**
   * API for delete comment in post
   * @param id
   * @returns
   */
  public async deleteComment(id: string): Promise<{ message: string }> {
    const findComment: any = await this.commentDAO.findOne({
      _id: ObjectID(id),
    });

    if (!findComment) {
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }
    //remove comment from redis
    await this.deleteCommentInRedis(id, findComment);

    await this.commentQueue.deleteComment({ commentId: id });

    return {
      message: messages.COMMENT_DELETED,
    };
  }

  /**
   * API for list comments of post
   * @param id
   * @param CommentListDto
   * @returns
   */
  public async commentList(postId: string, commentListDto: CommentListDto) {
    const { lastId, parentId, perPage } = commentListDto;
    const isFirstPage = !lastId && !parentId && !perPage;
    if (isFirstPage) {
      const cacheData = await this.cacheService.getCacheFromGroup(
        `post:${postId}`,
        'comments',
      );
      if (isNotEmpty(cacheData)) {
        return cacheData;
      }
    }
    const query: any = {
      postId: ObjectID(postId),
    };
    if (lastId) {
      query['_id'] = { $gt: ObjectID(lastId) };
    }
    if (parentId) {
      query['parentId'] = ObjectID(parentId);
    }

    const criteria: any = {
      match: query,
      limit: perPage,
    };

    const result = await this.commentDAO.getCommentList(criteria);
    const response = {
      comments: result,
      last_id: result.length ? result[result.length - 1]._id : null,
    };

    if (isFirstPage) {
      await this.cacheService.addCacheToGroup(
        `post:${postId}`,
        'comments',
        response,
      );
    }
    return response;
  }

  public async updateCommentDataInRedis(
    data: any,
    commentId: string,
  ): Promise<boolean> {
    const key = `post:${data?.postId}:comments`;
    const comments = await this.cacheService.lrange(key, 0, -1);

    for (let i = 0; i < comments.length; i++) {
      let parsed = JSON.parse(comments[i]);

      if (convertToString(data?.parentId) === parsed._id) {
        if (
          parsed.reply[0].commentId === commentId ||
          parsed.reply[0]._id === commentId
        ) {
          parsed.reply = [data];
          await this.cacheService.lset(key, i, JSON.stringify(parsed));
        }
        return true;
      } else if (parsed.commentId === commentId || parsed._id === commentId) {
        parsed = data;
        await this.cacheService.lset(key, i, JSON.stringify(parsed));
        return true;
      }
    }

    return false;
  }

  public async updateCommentReplyDataInRedis(data: any): Promise<boolean> {
    const key = `post:${data?.postId}:comments`;
    const comments = await this.cacheService.lrange(key, 0, -1);

    for (let i = 0; i < comments.length; i++) {
      let parsed = JSON.parse(comments[i]);
      if (convertToString(data?.parentId) === parsed._id) {
        parsed.reply = [data];
        await this.cacheService.lset(key, i, JSON.stringify(parsed));
        return true;
      }
    }
  }

  public async deleteCommentInRedis(
    commentId: string,
    data: any,
  ): Promise<boolean> {
    const key = `post:${data.postId}:comments`;
    const allComments = await this.cacheService.lrange(key, 0, -1);

    if (isValidAndDefined(data.parentId)) {
      for (let i = 0; i < allComments.length; i++) {
        let parsed = JSON.parse(allComments[i]);
        if (convertToString(data?.parentId) === parsed._id) {
          delete parsed.reply;
          await this.cacheService.lset(key, i, JSON.stringify(parsed));
          return true;
        }
      }
    } else {
      // Find the exact full string of the comment you want to remove
      const fullCommentString = allComments.find((c) => c.includes(commentId));

      if (fullCommentString) {
        await this.cacheService.lrem(key, 0, fullCommentString);
      }
    }
    return true;
  }
}
