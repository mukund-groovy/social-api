import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.schema';
import { BaseDAO } from '../common/base.dao';

@Injectable()
export class UserDAO extends BaseDAO<UserDocument> {
  constructor(@InjectModel(User.name) readonly userModel: Model<UserDocument>) {
    super(userModel);
  }
}
