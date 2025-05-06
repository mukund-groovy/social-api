import { Injectable } from '@nestjs/common';
import { UserDAO } from './user.dao';
import { UserDocument } from './entities/user.schema';
import { CommonService } from './../common/common.service';
import { messages } from '../../message.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserService extends CommonService<UserDocument> {
  constructor(private readonly userDAO: UserDAO) {
    super(userDAO);
  }

  //API for create user
  async saveUser(createUser: CreateUserDto) {
    try {
      const existingUser = await this.userDAO.findById(createUser._id);
      if (existingUser)
        return {
          message: messages.USER_ALREADY_EXIST,
          success: false,
        };

      await this.userDAO.create(createUser);

      return {
        message: messages.USER_SAVE,
        success: true,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || 'An unknown error occurred';
      return { success: false, message };
    }
  }

  //API for update user
  async updateUser(id: string, updateUser: UpdateUserDto) {
    // Your custom implementation here
    try {
      const user = await this.userDAO.findByIdAndUpdate(id, updateUser);

      if (user) {
        return { message: messages.USER_UPDATED, success: true };
      } else {
        return { message: messages.USER_NOT_FOUND, success: false };
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || 'An unknown error occurred';
      return { success: false, message };
    }
  }

  //API for delete user
  async deleteUser(id: string) {
    try {
      const user = await this.userDAO.findByIdAndDelete(id);
      if (user) {
        return { message: messages.USER_DELETE, success: true };
      } else {
        return { message: messages.USER_NOT_FOUND, success: false };
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error) || 'An unknown error occurred';
      return { success: false, message };
    }
  }

  async findAll(): Promise<UserDocument[] | any> {
    // Your custom implementation here
    const user = await this.getUser();
    return { ...user };
  }
}
