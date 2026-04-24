import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AlbumDocument = Album & Document;

@Schema()
export class Album {
  @Prop({ type: Types.ObjectId, ref: 'Artist', required: true })
  artist!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  releaseYear!: number;

  @Prop()
  image!: string;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);