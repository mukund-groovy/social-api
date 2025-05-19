import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { UserDAO } from './user.dao';
import { UserDocument } from './entities/user.schema';
import { CommonService } from './../common/common.service';
import { messages } from '../../message.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectID } from '@utils/mongodb.util';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UserService extends CommonService<UserDocument> {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private readonly userDAO: UserDAO,
  ) {
    super(userDAO);
  }

  async saveUser(
    createUser: CreateUserDto,
  ): Promise<{ message: string; data: UserDocument }> {
    const existingUser = await this.userDAO.findOne({
      userId: createUser.userId,
    });
    if (existingUser) {
      throw new ConflictException(messages.USER_ALREADY_EXIST);
    }

    const user = await this.userDAO.create(createUser);
    return {
      message: messages.USER_SAVE,
      data: user,
    };
  }

  async updateUser(
    id: string,
    updateUser: UpdateUserDto,
  ): Promise<{ message: string; data: UserDocument }> {
    const user = await this.userDAO.findOneAndUpdate(
      { userId: ObjectID(id) },
      updateUser,
    );
    if (!user) {
      throw new NotFoundException(messages.USER_NOT_FOUND);
    }
    return {
      message: messages.USER_UPDATED,
      data: user,
    };
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userDAO.findOneAndDelete({
      userId: ObjectID(id),
    });
    if (!user) {
      throw new NotFoundException(messages.USER_NOT_FOUND);
    }
    return {
      message: messages.USER_DELETE,
    };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userDAO.findById(id);
    if (!user) {
      throw new NotFoundException(messages.USER_NOT_FOUND);
    }
    return user;
  }

  async findOne(filter: object): Promise<UserDocument> {
    return await this.userDAO.findOne(filter);
  }

  async findAll(): Promise<UserDocument[]> {
    const users = await this.userDAO.findAll();
    return users;
  }
}
