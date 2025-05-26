import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type PostDocument = Post & Document;
@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  @Prop({ type: SchemaTypes.ObjectId, required: true, index: true })
  userId: ObjectId;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Array })
  media: [];

  @Prop({ type: Array })
  reportPost: [];
}
export const PostSchema = SchemaFactory.createForClass(Post);
