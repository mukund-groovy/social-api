import {
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
  Delete,
  Controller,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AddCommentDto } from './dto/create-comment.dto';
import { CommentListDto } from './dto/comment-list.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * API for create comment in post
   * @param commentDto
   * @returns
   */
  @Post()
  async addComment(@Body() addCommentDto: AddCommentDto) {
    return await this.commentService.addComment(addCommentDto);
  }

  /**
   * API for update comment in post
   * @param id
   * @param comment
   * @returns
   */
  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body('comment') comment: string,
  ) {
    return await this.commentService.updateComment(id, comment);
  }

  /**
   * API for delete comment in post
   * @param id
   * @returns
   */
  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    return await this.commentService.deleteComment(id);
  }

  /**
   * API for list comments of post
   * @param id
   * @param CommentListDto
   * @returns
   */
  @Get(':postId')
  async commentList(
    @Param('postId') postId: string,
    @Query() commentListDto: CommentListDto,
  ) {
    return await this.commentService.commentList(postId, commentListDto);
  }
}
