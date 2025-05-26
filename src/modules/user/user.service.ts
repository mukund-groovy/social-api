import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserDAO } from './user.dao';
import { UserDocument } from './entities/user.schema';
import { CommonService } from './../common/common.service';
import { messages } from '../../message.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectID } from '@utils/mongodb.util';
import { CacheService } from '../cache/cache.service';
import { isEmpty } from '@utils/lodash.util';

@Injectable()
export class UserService extends CommonService<UserDocument> {
  constructor(
    private readonly userDAO: UserDAO,
    private readonly cacheService: CacheService,
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

    if (!createUser?.displayName) {
      createUser.displayName =
        `${createUser.firstName} ${createUser.lastName}`.trim();
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
    const existUser = await this.userDAO.findOne({ userId: ObjectID(id) });
    if (!existUser) {
      throw new NotFoundException(messages.USER_NOT_FOUND);
    }

    const newDisplayName = updateUser.displayName?.trim();

    if (isEmpty(newDisplayName)) {
      delete updateUser.displayName;
    }

    const user = await this.userDAO.findOneAndUpdate(
      { userId: ObjectID(id) },
      updateUser,
    );
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

  async checkUser(userId: string): Promise<UserDocument> {
    const cached: any = await this.cacheService.getCacheFromGroup(
      'users',
      userId,
    );
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.userDAO.findOne({ userId: ObjectID(userId) });
    if (!user) {
      throw new NotFoundException(messages.USER_NOT_FOUND);
    }

    await this.cacheService.addCacheToGroup(
      'users',
      userId,
      JSON.stringify(user),
      3600,
    );

    return user;
  }
}
