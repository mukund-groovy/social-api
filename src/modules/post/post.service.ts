import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './entities/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CacheService } from '../cache/cache.service';
import { PostDAO } from './post.dao';
import { messages } from 'src/message.config';
import { ObjectID } from '../utils/mongodb.util';

@Injectable()
export class PostService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly postDAO: PostDAO,
  ) {}

  //API for create post
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
          : String(error) || 'An unknown error occurred';
      return { success: false, message };
    }
  }

  //API for update post
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
          : String(error) || 'An unknown error occurred';
      return { success: false, message };
    }
  }

  //API for delete post
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
          : String(error) || 'An unknown error occurred';
      return { success: false, message };
    }
  }

  //API for get all posts
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
          : String(error) || 'An unknown error occurred';
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
          : String(error) || 'An unknown error occurred';
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
          : String(error) || 'An unknown error occurred';
      return { success: false, message };
    }
  }
}
