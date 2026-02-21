import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResumeDocument = Resume & Document;

@Schema({ timestamps: true })
export class Resume {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  resumeName: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  uploadTime: Date;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
