/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, SchemaTypes } from 'mongoose';

export type PostLikeDocument = PostLike & Document;

@Schema({ timestamps: true, collection: 'post_likes' })
export class PostLike {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  postId: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Types.ObjectId;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
