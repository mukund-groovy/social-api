import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userData: Partial<User>) {
    return this.userService.create(userData);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: Partial<User>) {
    return this.userService.update({ _id: id }, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete({ _id: id });
  }
}
