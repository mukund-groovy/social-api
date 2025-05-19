import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { USER_TYPE } from '../user.constant';
import { ObjectId } from 'mongoose';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  userId: ObjectId;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  displayName: string;

  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(USER_TYPE)
  type: string;
}
