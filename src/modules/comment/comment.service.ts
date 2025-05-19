import { Injectable, NotFoundException } from '@nestjs/common';
import { AddCommentDto } from './dto/create-comment.dto';
import { CommentDocument } from './entities/comment.entity';
import { CommentDAO } from './comment.dao';
import { PostService } from '../post/post.service';
import { messages } from 'src/message.config';
import { ObjectID } from '@utils/mongodb.util';
import { CommentQueue } from './comment.queue';
import { CommentListDto } from './dto/comment-list.dto';
import { isDefined } from 'class-validator';
import { CommonService } from '../common/common.service';

@Injectable()
export class CommentService extends CommonService<CommentDocument> {
  constructor(
    private readonly postService: PostService,
    private readonly commentQueue: CommentQueue,
    private readonly commentDAO: CommentDAO,
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
    // await this.cacheService.delete(`post:${addCommentDto.post_id}:comments`);

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
  ): Promise<{ message: string; data: CommentDocument }> {
    const findComment = await this.commentDAO.findOne({
      _id: ObjectID(id),
      isDeleted: { $ne: true },
    });

    if (!findComment) {
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }
    const data = {
      postId: id,
      comment: comment,
    };
    await this.commentQueue.updateComment(data);

    // Invalidate Redis cache for that post’s comments
    // await this.cacheService.delete(
    //   `post:${convertToString(findComment.postId)}:comments`,
    // );

    return {
      message: messages.COMMENT_UPDATED,
      data: findComment,
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

    await this.commentQueue.deleteComment({ postId: id });

    // Invalidate Redis cache for that post’s comments
    // await this.cacheService.delete(
    //   `post:${convertToString(findComment.postId)}:comments`,
    // );

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
    const query: any = {
      postId: ObjectID(postId),
      parentId: '0',
      isDeleted: { $ne: true },
    };
    if (commentListDto.lastId) {
      query['_id'] = { $gt: ObjectID(commentListDto.lastId) };
    }

    if (isDefined(commentListDto.parentId)) {
      query['parentId'] = commentListDto.parentId;
    }
    const criteria: any = {
      match: query,
      limit: commentListDto?.perPage,
    };

    const result = await this.commentDAO.getCommentList(criteria);
    return {
      comments: result,
      last_id: result.length ? result[result.length - 1]._id : null,
    };
  }
}
