import { Controller, Get, Post, Delete, Param, Query, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { PhotoService } from './photo.service';
import type { CreatePhotoRequest } from '@shared/api.interface';

@Controller('api/photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get()
  async getPhotos(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    return this.photoService.getPhotos(pageNum, pageSizeNum);
  }

  @Get(':id')
  async getPhotoDetail(@Param('id') id: string) {
    return this.photoService.getPhotoDetail(id);
  }

  @NeedLogin()
  @Post()
  async createPhoto(@Req() req: Request, @Body() body: CreatePhotoRequest) {
    return this.photoService.createPhoto(body);
  }

  @NeedLogin()
  @Delete(':id')
  async deletePhoto(@Param('id') id: string) {
    return this.photoService.deletePhoto(id);
  }
}
