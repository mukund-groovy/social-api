/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type PostCommentDocument = PostComment & Document;

@Schema({ timestamps: true, collection: 'post_comments' })
export class PostComment {
  @Prop({ type: String, default: 0 })
  parentId: string;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId: ObjectId;

  @Prop({ type: String })
  comment: string;

  @Prop({ type: Boolean })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, index: true })
  postId: ObjectId;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);
