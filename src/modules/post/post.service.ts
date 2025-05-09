import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDocument } from './entities/post.schema';
import { CacheService } from '../cache/cache.service';
import { PostDAO } from './post.dao';
import { messages } from 'src/message.config';
import { AddCommentDto } from './dto/add-comment.dto';
import { ObjectID } from 'src/utils/mongodb.util';
import { PostCommentDAO } from './comment.dao';
import { sortFilterPagination } from 'src/utils/function.util';
import { isDefined } from 'src/utils/lodash.util';
import { CommentListDto } from './dto/comment-list.dto';
import { LikeDto } from './dto/like.dto';
import { PostLikeDAO } from './like.dao';
import { Type } from './post.constant';
import { UserLikeDto } from './dto/user-like.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postDAO: PostDAO,
    private readonly commentDAO: PostCommentDAO,
    private readonly likeDAO: PostLikeDAO,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * API for create post
   * @param createPostDto
   * @returns
   */
  public async createPost(createPostDto: CreatePostDto) {
    try {
      //Create Post
      // const post = await this.postDAO.create(createPostDto);
      const data = {
        ...createPostDto,
        type: 'create',
      };
      await this.cacheService.addPostJob(data);
      //TODO: Add logic for upload post file in azure file container
      return { message: messages.POST_CREATE, success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for update post
   * @param id
   * @param updatePostDto
   * @returns
   */
  async updatePost(id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postDAO.findOne({ _id: ObjectID(id) });

      if (post) {
        const data = {
          ...updatePostDto,
          type: 'update',
          postId: ObjectID(id),
        };
        await this.cacheService.addPostJob(data);
        //TODO: Add logic for upload post file data in azure file container
        return { message: messages.POST_UPDATE, success: true };
      } else {
        return { message: messages.POST_NOT_FOUND, success: false };
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for delete post
   * @param id
   * @returns
   */
  async deletePost(id: string) {
    try {
      const post = await this.postDAO.findOne(ObjectID(id));
      if (post) {
        const data = {
          type: 'delete',
          postId: ObjectID(id),
        };
        await this.cacheService.addPostJob(data);
        return { message: messages.POST_DELETE, success: true };
      } else {
        return { message: messages.POST_NOT_FOUND, success: false };
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * APi for get list of post
   * @returns
   */
  async findAll(): Promise<PostDocument[] | any> {
    // Your custom implementation here
    const post = await this.postDAO.findAll();
    return post;
  }

  async create(data: object) {
    try {
      const result = await this.postDAO.create(data);
      return { success: true, data: result };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  async findByIdAndUpdate(id: string, update: object) {
    try {
      const data = await this.postDAO.findByIdAndUpdate(id, update);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  async findByIdAndDelete(id: string) {
    try {
      const result = await this.postDAO.findByIdAndDelete(id);
      return { success: true, data: result };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for create comment in post
   * @param AddCommentDto
   * @returns
   */
  public async addComment(addCommentDto: AddCommentDto) {
    try {
      // Check if the post with the provided post ID exists and is not blocked.
      const findPost = await this.postDAO.findOne(
        {
          _id: ObjectID(addCommentDto.postId),
          isDeleted: { $ne: true },
        },
        { _id: 1 },
      );

      if (!findPost) {
        return {
          success: false,
          message: messages.POST_NOT_FOUND,
        };
      }

      const createComment: any = {
        parentId: addCommentDto.parentId || 0,
        comment: addCommentDto.comment,
        postId: addCommentDto.postId,
        userId: addCommentDto.userId,
      };
      // Save the new comment to the database.
      await this.commentDAO.create(createComment);

      // Delete Redis cache for that post’s comments
      // await this.cacheService.delete(`post:${addCommentDto.post_id}:comments`);

      return {
        success: true,
        message: messages.COMMENT_ADDED,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for update comment in post
   * @param id
   * @param comment
   * @returns
   */
  public async updateComment(id: string, comment: string) {
    try {
      //find the comment in the database using the provided id and update
      const findComment = await this.commentDAO.findOneAndUpdate(
        { _id: ObjectID(id), isDeleted: { $ne: true } },
        { comment },
      );

      if (!findComment) {
        return {
          success: false,
          message: messages.COMMENT_NOT_FOUND,
        };
      }

      // Invalidate Redis cache for that post’s comments
      // await this.cacheService.delete(
      //   `post:${convertToString(findComment.postId)}:comments`,
      // );

      return {
        success: true,
        message: messages.COMMENT_UPDATED,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for delete comment in post
   * @param id
   * @returns
   */
  public async deleteComment(id: string) {
    try {
      //find the comment in the database using the provided id and add is_delete key
      const findComment = await this.commentDAO.updateMany(
        {
          $or: [{ _id: ObjectID(id) }, { parentId: id }],
        },
        {
          $set: {
            isDeleted: true,
          },
        },
      );
      if (!findComment) {
        return {
          success: false,
          message: messages.POST_NOT_FOUND,
        };
      }

      // Invalidate Redis cache for that post’s comments
      // await this.cacheService.delete(
      //   `post:${convertToString(findComment.postId)}:comments`,
      // );

      return {
        success: true,
        message: messages.COMMENT_DELETED,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for list comments of post
   * @param id
   * @param CommentListDto
   * @returns
   */
  public async commentList(id: string, commentListDto: CommentListDto) {
    try {
      // Define a match query to filter data
      const query: any = {
        parentId: '0',
        isDeleted: { $ne: true },
        postId: ObjectID(id),
      };

      if (isDefined(commentListDto.parentId)) {
        query['parentId'] = commentListDto.parentId;
      }

      // Calculate the total count of items
      const criteria: any = {};
      criteria.match = query;
      criteria.count = true;
      const total_record = await this.commentDAO.getCommentList(criteria);

      // Perform pagination and sorting
      const {
        per_page,
        page,
        total_pages,
        prev_enable,
        next_enable,
        start_from,
        sort,
      } = sortFilterPagination(
        commentListDto.page,
        commentListDto.perPage,
        total_record,
      );

      // Retrieve and process the data
      criteria.start_from = start_from;
      criteria.per_page = per_page;
      criteria.sort = sort;
      delete criteria.count;
      const data = await this.commentDAO.getCommentList(criteria);
      return {
        data,
        success: true,
        total_count: total_record,
        prev_enable: prev_enable,
        next_enable: next_enable,
        total_pages: total_pages,
        per_page: per_page,
        page: page,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for post like unlike
   * @param LikeDto
   * @returns
   */
  public async likeDislike(likeDto: LikeDto) {
    try {
      //Check post exist or not
      const postData = await this.postDAO.findOne({
        _id: ObjectID(likeDto.postId),
        isDeleted: { $ne: true },
      });

      if (!postData) {
        return {
          message: messages.POST_NOT_FOUND,
          success: false,
        };
      }

      const findLikeData = await this.likeDAO.findOne({
        postId: ObjectID(likeDto.postId),
        userId: ObjectID(likeDto.userId),
      });

      const dtl: any = {
        postId: likeDto.postId,
        userId: likeDto.userId,
      };

      if (likeDto.type === Type.LIKE && !findLikeData) {
        //Add record for comment like
        await this.likeDAO.create(dtl);
      } else if (likeDto.type === Type.DISLIKE && findLikeData) {
        //delete liked record from db
        await this.likeDAO.findOneAndDelete(dtl);
      }

      const msg =
        likeDto.type === Type.LIKE
          ? messages.POST_LIKED
          : messages.POST_DISLIKED;

      return {
        message: msg,
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }

  /**
   * API for post likes user list
   * @param id
   * @param param
   * @returns
   */
  public async likeUserList(id: string, userLikeDto: UserLikeDto) {
    try {
      const criteria: any = {};
      criteria.match = {
        postId: ObjectID(id),
      };
      criteria.count = true;
      const total_record = await this.likeDAO.getLikeUserList(criteria);

      // Perform pagination and sorting
      const {
        per_page,
        page,
        total_pages,
        prev_enable,
        next_enable,
        start_from,
        sort,
      } = sortFilterPagination(
        userLikeDto.page,
        userLikeDto.perPage,
        total_record,
        null,
        'createdAt',
        1,
      );
      criteria.start_from = start_from;
      criteria.per_page = per_page;
      criteria.sort = sort;
      delete criteria.count;
      const data = await this.likeDAO.getLikeUserList(criteria);
      return {
        data: data,
        success: true,
        total_count: total_record,
        prev_enable: prev_enable,
        next_enable: next_enable,
        total_pages: total_pages,
        per_page: per_page,
        page: page,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || messages.UNKNOWN_ERROR;
      return { success: false, message };
    }
  }
}
