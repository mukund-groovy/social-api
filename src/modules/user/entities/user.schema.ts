import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
import { USER_TYPE } from '../user.constant';

export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop({ type: SchemaTypes.ObjectId, required: true, index: true })
  userId: ObjectId;

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, required: true })
  phoneCode: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String, required: true, enum: USER_TYPE })
  type: string;

  @Prop({ type: Boolean })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
