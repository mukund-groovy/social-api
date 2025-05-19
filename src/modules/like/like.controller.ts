import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeUnlikeDto } from './dto/like-unlike.dto';
import { UserLikeDto } from './dto/user-like.dto';
import { SignatureAuthGuard } from 'src/auth/guards/signature-auth.guard';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  /**
   * API for like post
   * @param likeDto
   * @returns
   */
  @UseGuards(SignatureAuthGuard)
  @Post('like-post')
  likePost(@Body() likeDto: LikeUnlikeDto) {
    return this.likeService.likePost(likeDto);
  }

  /**
   * API for unlike post
   * @param unlikeDto
   * @returns
   */
  @UseGuards(SignatureAuthGuard)
  @Post('unlike-post')
  unlikePost(@Body() unlikeDto: LikeUnlikeDto) {
    return this.likeService.unlikePost(unlikeDto);
  }

  /**
   * API for post likes user list
   * @param postId
   * @param query
   * @returns
   */
  @UseGuards(SignatureAuthGuard)
  @Get('user-list/:postId')
  likeUserList(
    @Param('postId') postId: string,
    @Query() userLikeDto: UserLikeDto,
  ) {
    return this.likeService.likeUserList(postId, userLikeDto);
  }
}
