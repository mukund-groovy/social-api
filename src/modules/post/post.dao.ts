import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './entities/post.schema';
import { BaseDAO } from '../common/base.dao';

@Injectable()
export class PostDAO extends BaseDAO<PostDocument> {
  constructor(@InjectModel(Post.name) readonly postModel: Model<PostDocument>) {
    super(postModel);
  }
}
