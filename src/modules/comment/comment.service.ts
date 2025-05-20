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
    };

    await this.commentQueue.addComment(createComment);

    // Delete Redis cache for that post’s comments
    await this.cacheService.delete(`post:${addCommentDto.postId}:comments`);

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
    const findComment = await this.commentDAO.findOne({
      _id: ObjectID(id),
      isDeleted: { $ne: true },
    });

    if (!findComment) {
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }
    const data = {
      commentId: id,
      comment: comment,
    };
    await this.commentQueue.updateComment(data);

    // Invalidate Redis cache for that post’s comments
    await this.cacheService.delete(
      `post:${convertToString(findComment.postId)}:comments`,
    );

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
    const findComment = await this.commentDAO.findOne({
      _id: ObjectID(id),
      isDeleted: { $ne: true },
    });

    if (!findComment) {
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }

    await this.commentQueue.deleteComment({ commentId: id });

    // Invalidate Redis cache for that post’s comments
    await this.cacheService.delete(
      `post:${convertToString(findComment.postId)}:comments`,
    );

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
      parentId: parentId ?? '0',
      isDeleted: { $ne: true },
    };
    if (lastId) {
      query['_id'] = { $gt: ObjectID(lastId) };
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
}
