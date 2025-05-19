/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
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

export const CommentSchema = SchemaFactory.createForClass(Comment);
