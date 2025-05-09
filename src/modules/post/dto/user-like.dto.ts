import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UserLikeDto {
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
