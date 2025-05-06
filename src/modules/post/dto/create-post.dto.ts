import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsOptional()
  photos: [];

  @IsString()
  @IsNotEmpty()
  user_id: ObjectId;
}
