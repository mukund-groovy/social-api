import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { CommentListDto } from './dto/comment-list.dto';
import { LikeDto } from './dto/like.dto';
import { UserLikeDto } from './dto/user-like.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * API for create post
   * @param createPostDto
   * @returns
   */
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
  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    return this.postService.deletePost(id);
  }

  /**
   * API for get list of post
   * @returns
   */
  @Get()
  async getAllPosts() {
    return this.postService.findAll();
  }

  /**
   * API for create comment in post
   * @param commentDto
   * @returns
   */
  @Post('add-comment')
  async addComment(@Body() addCommentDto: AddCommentDto) {
    return await this.postService.addComment(addCommentDto);
  }

  /**
   * API for update comment in post
   * @param id
   * @param comment
   * @returns
   */
  @Put('update-comment/:id')
  async updateComment(
    @Param('id') id: string,
    @Body('comment') comment: string,
  ) {
    return await this.postService.updateComment(id, comment);
  }

  /**
   * API for delete comment in post
   * @param id
   * @returns
   */
  @Delete('delete-comment/:id')
  async deleteComment(@Param('id') id: string) {
    return await this.postService.deleteComment(id);
  }

  /**
   * API for list comments of post
   * @param id
   * @param CommentListDto
   * @returns
   */
  @Get('comment-list/:id')
  async commentList(
    @Param('id') id: string,
    @Query() commentListDto: CommentListDto,
  ) {
    return await this.postService.commentList(id, commentListDto);
  }

  /**
   * API for post like dislike
   * @param likeDto
   * @returns
   */
  @Post('like-dislike')
  async likeDislike(@Body() likeDto: LikeDto) {
    return await this.postService.likeDislike(likeDto);
  }

  /**
   * API for post likes user list
   * @param postId
   * @param query
   * @returns
   */
  @Get('like-user-list/:postId')
  async likeUserList(
    @Param('postId') postId: string,
    @Query() userLikeDto: UserLikeDto,
  ) {
    return await this.postService.likeUserList(postId, userLikeDto);
  }
}
