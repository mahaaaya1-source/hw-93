import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { AuthGuard } from '@nestjs/passport';
  import { Model } from 'mongoose';
  import { Request } from 'express';
  
  import { User, UserDocument } from '../schemas/user.schema';
  import { CreateUserDto } from './create-user.dto';
  import { TokenAuthGuard } from '../token-auth.guard';
  
  @Controller('users')
  export class UsersController {
    constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}
  
    @Post()
    async registerUser(@Body() userData: CreateUserDto) {
      const user = new this.userModel({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });
  
      user.generateToken();
  
      return user.save();
    }
  
    @UseGuards(AuthGuard('local'))
    @Post('sessions')
    async login(@Req() req: Request) {
      return req.user;
    }
  
    @UseGuards(TokenAuthGuard)
    @Delete('sessions')
    async logout(@Req() req: Request) {
      const user = req.user as UserDocument;
  
      user.generateToken();
      await user.save();
  
      return { message: 'Logout successful' };
    }
  
    @UseGuards(TokenAuthGuard)
    @Get('secret')
    async secret(@Req() req: Request) {
      return req.user;
    }
  }