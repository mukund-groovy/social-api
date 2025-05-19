/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  parentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  comment: string;
}
