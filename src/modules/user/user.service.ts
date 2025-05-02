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
    console.log('userservice');
    return 'OK';
    // Your custom implementation here
    const user = this.getUser();
    return { ...user };
  }
}
