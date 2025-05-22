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
import { convertToString } from '@utils/lodash.util';
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
    const findPost = await this.postService.findOne({
      _id: ObjectID(addCommentDto.postId),
      isDeleted: { $ne: true },
    });

    if (!findPost) {
      throw new NotFoundException(messages.POST_NOT_FOUND);
    }

    const createComment: any = {
      parentId: addCommentDto?.parentId,
      comment: addCommentDto.comment,
      postId: addCommentDto.postId,
      userId: addCommentDto.userId,
      commentId: randomUUID(),
    };
    const redisKey = `post:${addCommentDto.postId}:comments`;

    // Add new comment to the start of the list
    await this.cacheService.lpush(redisKey, JSON.stringify(createComment));

    // Keep only the latest 10 comments (index 0 to 9)
    await this.cacheService.ltrim(redisKey, 0, 9);

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
      isDeleted: { $ne: true },
    });

    if (!findComment) {
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }
    const data = {
      _id: id,
      commentId: id,
      comment: comment,
      postId: findComment.postId,
    };
    await this.updateCommentDataInRedis(data, id);
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
    await this.deleteCommentInRedis(id, findComment.postId);

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
      const parsed = JSON.parse(comments[i]);

      if (parsed.commentId === commentId) {
        parsed.commentId = data?._id;
        parsed.comment = data?.comment;
        await this.cacheService.lset(key, i, JSON.stringify(parsed));
        return true;
      }
    }

    return false;
  }

  public async deleteCommentInRedis(
    commentId: string,
    postId: string,
  ): Promise<boolean> {
    const key = `post:${postId}:comments`;
    const allComments = await this.cacheService.lrange(key, 0, -1);

    // Find the exact full string of the comment you want to remove
    const fullCommentString = allComments.find((c) => c.includes(commentId));

    if (fullCommentString) {
      await this.cacheService.lrem(key, 0, fullCommentString);
    }
    return true;
  }
}
