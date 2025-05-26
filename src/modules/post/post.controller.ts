import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SignatureAuthGuard } from 'src/common/guards/signature-auth.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * API for create post
   * @param createPostDto
   * @returns
   */
  @UseGuards(SignatureAuthGuard)
  @Post('create')
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postService.createPost(createPostDto);
  }

  /**
   * API for update post
   * @param id
   * @param updatePostDto
   * @returns
   */
  @UseGuards(SignatureAuthGuard)
  @Put('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(id, updatePostDto);
  }

  /**
   * API for delete post
   * @param id
   * @returns
   */
  @UseGuards(SignatureAuthGuard)
  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    return this.postService.deletePost(id);
  }

  /**
   * API for get list of post
   * @returns
   */
  @UseGuards(SignatureAuthGuard)
  @Get()
  async getAllPosts() {
    return this.postService.findAll();
  }
}
