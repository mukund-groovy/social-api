import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDocument } from './entities/post.schema';
import { PostDAO } from './post.dao';
import { messages } from 'src/message.config';
import { ObjectID } from '@utils/mongodb.util';
import { PostQueue } from './post.queue';

@Injectable()
export class PostService {
  constructor(
    private readonly postDAO: PostDAO,
    private readonly postQueue: PostQueue,
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
    await this.postQueue.addPostJob(data);
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
    await this.postQueue.addPostJob(data);
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
    await this.postQueue.addPostJob(data);
    return { message: messages.POST_DELETE };
  }

  /**
   * APi for get list of post
   * @returns
   */
  async findAll(): Promise<PostDocument[]> {
    return await this.postDAO.findAll();
  }

  async findOne(query: object): Promise<PostDocument> {
    return await this.postDAO.findOne(query);
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
}
