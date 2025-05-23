import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsOptional()
  media: [];

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
