import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type PostDocument = Post & Document;
@Schema({ timestamps: true, collection: 'post' })
export class Post {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId: ObjectId;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Array, default: [] })
  photos: [];

  @Prop({ type: Array })
  reportPost: [];
}
export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ user_id: 1 });
