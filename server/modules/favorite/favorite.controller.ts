import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { FavoriteService } from './favorite.service';
import type { CreateFavoriteRequest } from '@shared/api.interface';

@Controller('api/favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    return this.favoriteService.findAll(type, pageNum, pageSizeNum);
  }

  @NeedLogin()
  @Post()
  async create(@Body() body: CreateFavoriteRequest) {
    return this.favoriteService.create(body);
  }

  @NeedLogin()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.favoriteService.remove(id);
  }
}
