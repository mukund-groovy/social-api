import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  phoneCode: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: Boolean })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
