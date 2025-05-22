import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
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
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  @Max(100)
  perPage: number;
}
