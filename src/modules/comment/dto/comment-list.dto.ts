import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CommentListDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsMongoId()
  lastId: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  perPage: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsMongoId()
  parentId: string;
}
