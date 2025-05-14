import { Injectable, NotFoundException } from '@nestjs/common';
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
import { PostCommentDocument } from './entities/post-comment.entity';
import { PaginatedResponse } from 'src/interface/response.interface';
import { PostLikeDocument } from './entities/post-like.entity';

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
  public async createPost(
    createPostDto: CreatePostDto,
  ): Promise<{ message: string }> {
    const data = {
      ...createPostDto,
      type: 'create',
    };
    await this.cacheService.addPostJob(data);
    return { message: messages.POST_CREATE };
  }

  /**
   * API for update post
   * @param id
   * @param updatePostDto
   * @returns
   */
  async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<{ message: string }> {
    const post = await this.postDAO.findOne({ _id: ObjectID(id) });

    if (!post) {
      throw new NotFoundException(messages.POST_NOT_FOUND);
    }
    const data = {
      ...updatePostDto,
      type: 'update',
      postId: ObjectID(id),
    };
    await this.cacheService.addPostJob(data);
    return { message: messages.POST_UPDATE };
  }

  /**
   * API for delete post
   * @param id
   * @returns
   */
  async deletePost(id: string): Promise<{ message: string }> {
    const post = await this.postDAO.findOne(ObjectID(id));
    if (!post) {
      throw new NotFoundException(messages.POST_NOT_FOUND);
    }
    const data = {
      type: 'delete',
      postId: ObjectID(id),
    };
    await this.cacheService.addPostJob(data);
    return { message: messages.POST_DELETE };
  }

  /**
   * APi for get list of post
   * @returns
   */
  async findAll(): Promise<PostDocument[]> {
    return await this.postDAO.findAll();
  }

  async create(createData: object) {
    return await this.postDAO.create(createData);
  }

  async findByIdAndUpdate(id: string, update: object) {
    return await this.postDAO.findByIdAndUpdate(id, update);
  }

  async findByIdAndDelete(id: string) {
    return await this.postDAO.findByIdAndDelete(id);
  }

  /**
   * API for create comment in post
   * @param AddCommentDto
   * @returns
   */
  public async addComment(
    addCommentDto: AddCommentDto,
  ): Promise<{ message: string; data: PostCommentDocument }> {
    const findPost = await this.postDAO.findOne(
      {
        _id: ObjectID(addCommentDto.postId),
        isDeleted: { $ne: true },
      },
      { _id: 1 },
    );

    if (!findPost) {
      throw new NotFoundException(messages.POST_NOT_FOUND);
    }

    const createComment: any = {
      parentId: addCommentDto.parentId || 0,
      comment: addCommentDto.comment,
      postId: addCommentDto.postId,
      userId: addCommentDto.userId,
    };
    const comment = await this.commentDAO.create(createComment);

    // Delete Redis cache for that post’s comments
    // await this.cacheService.delete(`post:${addCommentDto.post_id}:comments`);

    return {
      message: messages.COMMENT_ADDED,
      data: comment,
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
  ): Promise<{ message: string; data: PostCommentDocument }> {
    const findComment = await this.commentDAO.findOneAndUpdate(
      { _id: ObjectID(id), isDeleted: { $ne: true } },
      { comment },
    );

    if (!findComment) {
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }

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
      throw new NotFoundException(messages.COMMENT_NOT_FOUND);
    }

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
  public async commentList(
    id: string,
    commentListDto: CommentListDto,
  ): Promise<PaginatedResponse<PostCommentDocument>> {
    const query: any = {
      parentId: '0',
      isDeleted: { $ne: true },
      postId: ObjectID(id),
    };

    if (isDefined(commentListDto.parentId)) {
      query['parentId'] = commentListDto.parentId;
    }

    const criteria: any = {};
    criteria.match = query;
    criteria.count = true;

    const countResponse = await this.commentDAO.getCommentList(criteria);
    if (countResponse.type !== 'count') {
      throw new Error('Expected count result, but got list');
    }
    const total_record = countResponse.data;

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

    criteria.start_from = start_from;
    criteria.per_page = per_page;
    criteria.sort = sort;
    delete criteria.count;

    const dataResponse = await this.commentDAO.getCommentList(criteria);
    if (dataResponse.type !== 'list') {
      throw new Error('Expected list result, but got count');
    }

    return {
      data: dataResponse.data,
      total_count: total_record,
      prev_enable: prev_enable,
      next_enable: next_enable,
      total_pages: total_pages,
      per_page: per_page,
      page: page,
    };
  }

  /**
   * API for post like unlike
   * @param LikeDto
   * @returns
   */
  public async likeDislike(likeDto: LikeDto): Promise<{ message: string }> {
    const postData = await this.postDAO.findOne({
      _id: ObjectID(likeDto.postId),
      isDeleted: { $ne: true },
    });

    if (!postData) {
      throw new NotFoundException(messages.POST_NOT_FOUND);
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
      await this.likeDAO.create(dtl);
    } else if (likeDto.type === Type.DISLIKE && findLikeData) {
      await this.likeDAO.findOneAndDelete(dtl);
    }

    const msg =
      likeDto.type === Type.LIKE ? messages.POST_LIKED : messages.POST_DISLIKED;

    return {
      message: msg,
    };
  }

  /**
   * API for post likes user list
   * @param id
   * @param param
   * @returns
   */
  public async likeUserList(
    id: string,
    userLikeDto: UserLikeDto,
  ): Promise<PaginatedResponse<PostLikeDocument>> {
    const criteria: any = {};
    criteria.match = {
      postId: ObjectID(id),
    };
    criteria.count = true;

    const countResponse = await this.likeDAO.getLikeUserList(criteria);
    if (countResponse.type !== 'count') {
      throw new Error('Expected count result, but got list');
    }
    const total_record = countResponse.data;

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

    const dataResponse = await this.likeDAO.getLikeUserList(criteria);
    if (dataResponse.type !== 'list') {
      throw new Error('Expected list result, but got count');
    }

    return {
      data: dataResponse.data,
      total_count: total_record,
      prev_enable: prev_enable,
      next_enable: next_enable,
      total_pages: total_pages,
      per_page: per_page,
      page: page,
    };
  }
}
