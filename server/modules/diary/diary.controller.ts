import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { DiaryService } from './diary.service';
import type { CreateDiaryRequest, UpdateDiaryRequest } from '@shared/api.interface';

@Controller('api/diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    return this.diaryService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.diaryService.findById(id);
  }

  @NeedLogin()
  @Post()
  async create(@Body() body: CreateDiaryRequest) {
    return this.diaryService.create(body);
  }

  @NeedLogin()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDiaryRequest) {
    return this.diaryService.update(id, body);
  }

  @NeedLogin()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.diaryService.remove(id);
  }
}
