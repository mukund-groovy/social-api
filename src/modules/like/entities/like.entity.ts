/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, SchemaTypes } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  postId: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  userId: mongoose.Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
