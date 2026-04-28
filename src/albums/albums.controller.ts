import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { Model } from 'mongoose';
  
  import { Album, AlbumDocument } from '../schemas/album.schema';
  import { Artist, ArtistDocument } from '../schemas/artist.schema';
  import { Track, TrackDocument } from '../schemas/track.schema';
  import { CreateAlbumDto } from './create-album.dto';
  import { createMulterOptions } from '../utils/multer';
  import { TokenAuthGuard } from '../token-auth.guard';
  import { AdminGuard } from '../admin.guard';
  
  @Controller('albums')
  export class AlbumsController {
    constructor(
      @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
      @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
      @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    ) {}
  
    @Get()
    async getAll(@Query('artist') artistId?: string) {
      if (artistId) {
        return this.albumModel.find({ artist: artistId }).populate('artist');
      }
  
      return this.albumModel.find().populate('artist');
    }
  
    @Get(':id')
    async getOne(@Param('id') id: string) {
      const album = await this.albumModel.findById(id).populate('artist');
  
      if (!album) {
        throw new NotFoundException('Album not found');
      }
  
      return album;
    }
  
    @UseGuards(TokenAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('image', createMulterOptions('albums')))
    async create(
      @UploadedFile() file: Express.Multer.File,
      @Body() albumData: CreateAlbumDto,
    ) {
      const artistExists = await this.artistModel.findById(albumData.artist);
  
      if (!artistExists) {
        throw new NotFoundException('Artist not found');
      }
  
      const album = new this.albumModel({
        artist: albumData.artist,
        title: albumData.title,
        releaseYear: Number(albumData.releaseYear),
        image: file ? 'uploads/albums/' + file.filename : null,
      });
  
      return album.save();
    }
  
    @UseGuards(TokenAuthGuard, AdminGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
      const album = await this.albumModel.findById(id);
  
      if (!album) {
        throw new NotFoundException('Album not found');
      }
  
      await this.trackModel.deleteMany({ album: id });
      await this.albumModel.findByIdAndDelete(id);
  
      return { message: 'Album deleted successfully' };
    }
  }