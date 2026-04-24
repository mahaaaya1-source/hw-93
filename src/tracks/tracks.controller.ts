import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Query,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  
  import { Track, TrackDocument } from '../schemas/track.schema';
  import { Album, AlbumDocument } from '../schemas/album.schema';
  import { CreateTrackDto } from './create-track.dto';
  
  @Controller('tracks')
  export class TracksController {
    constructor(
      @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
      @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    ) {}
  
    @Get()
    async getAll(@Query('album') albumId?: string) {
      if (albumId) {
        return this.trackModel.find({ album: albumId }).populate({
          path: 'album',
          populate: {
            path: 'artist',
          },
        });
      }
  
      return this.trackModel.find().populate({
        path: 'album',
        populate: {
          path: 'artist',
        },
      });
    }
  
    @Post()
    async create(@Body() trackData: CreateTrackDto) {
      const albumExists = await this.albumModel.findById(trackData.album);
  
      if (!albumExists) {
        throw new NotFoundException('Album not found');
      }
  
      const track = new this.trackModel({
        album: trackData.album,
        title: trackData.title,
        duration: Number(trackData.duration),
      });
  
      return track.save();
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      const track = await this.trackModel.findById(id);
  
      if (!track) {
        throw new NotFoundException('Track not found');
      }
  
      await this.trackModel.findByIdAndDelete(id);
  
      return { message: 'Track deleted successfully' };
    }
  }