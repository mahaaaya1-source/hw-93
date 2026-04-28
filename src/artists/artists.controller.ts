import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { Model } from 'mongoose';
  
  import { Artist, ArtistDocument } from '../schemas/artist.schema';
  import { Album, AlbumDocument } from '../schemas/album.schema';
  import { Track, TrackDocument } from '../schemas/track.schema';
  import { CreateArtistDto } from './create-artist.dto';
  import { createMulterOptions } from '../utils/multer';
  import { TokenAuthGuard } from '../token-auth.guard';
  import { AdminGuard } from '../admin.guard';
  
  @Controller('artists')
  export class ArtistsController {
    constructor(
      @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
      @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
      @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    ) {}
  
    @Get()
    async getAll() {
      return this.artistModel.find();
    }
  
    @Get(':id')
    async getOne(@Param('id') id: string) {
      const artist = await this.artistModel.findById(id);
  
      if (!artist) {
        throw new NotFoundException('Artist not found');
      }
  
      return artist;
    }
  
    @UseGuards(TokenAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('image', createMulterOptions('artists')))
    async create(
      @UploadedFile() file: Express.Multer.File,
      @Body() artistData: CreateArtistDto,
    ) {
      const artist = new this.artistModel({
        name: artistData.name,
        info: artistData.info,
        image: file ? 'uploads/artists/' + file.filename : null,
      });
  
      return artist.save();
    }
  
    @UseGuards(TokenAuthGuard, AdminGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
      const artist = await this.artistModel.findById(id);
  
      if (!artist) {
        throw new NotFoundException('Artist not found');
      }
  
      const albums = await this.albumModel.find({ artist: id });
      const albumIds = albums.map((album) => album._id);
  
      await this.trackModel.deleteMany({ album: { $in: albumIds } });
      await this.albumModel.deleteMany({ artist: id });
      await this.artistModel.findByIdAndDelete(id);
  
      return { message: 'Artist deleted successfully' };
    }
  }