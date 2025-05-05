import { Injectable } from '@nestjs/common';
import { UserDAO } from './user.dao';
import { UserDocument } from './entities/user.schema';
import { CommonService } from './../common/common.service';

@Injectable()
export class UserService extends CommonService<UserDocument> {
  constructor(private readonly userDAO: UserDAO) {
    super(userDAO);
  }

  async findAll(): Promise<UserDocument[] | any> {
    // Your custom implementation here
    const user = await this.getUser();
    return { ...user };
  }
}
