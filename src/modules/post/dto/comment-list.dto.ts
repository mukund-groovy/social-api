import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CommentListDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  parentId: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  perPage: number;
}
