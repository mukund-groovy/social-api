import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class UserLikeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsMongoId()
  lastId: ObjectId;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  perPage: number;
}
