import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Prop({ type: Types.ObjectId, ref: 'Album', required: true })
  album!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  duration!: number;
}

export const TrackSchema = SchemaFactory.createForClass(Track);