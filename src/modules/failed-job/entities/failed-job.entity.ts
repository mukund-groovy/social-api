import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FailedJobDocument = FailedJob & Document;

@Schema({ timestamps: true })
export class FailedJob {
  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true })
  jobName: string;

  @Prop({ required: true })
  queueName: string;

  @Prop({ type: Object, required: true })
  data: Record<string, any>;

  @Prop({ required: true })
  error: string;

  @Prop({ default: Date.now })
  failedAt: Date;

  @Prop()
  attemptsMade?: number;

  @Prop()
  failedReason?: string;

  @Prop()
  processedOn?: number;

  @Prop()
  timestamp?: number;

  @Prop({ type: Object })
  returnvalue?: any;
}

export const FailedJobSchema = SchemaFactory.createForClass(FailedJob);
