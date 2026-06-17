import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { HabitService } from './habit.service';
import type { CreateHabitRequest } from '@shared/api.interface';

@Controller('api/habits')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Get()
  async findAll() {
    return this.habitService.findAll();
  }

  @NeedLogin()
  @Post()
  async create(@Body() dto: CreateHabitRequest) {
    return this.habitService.create(dto);
  }

  @NeedLogin()
  @Patch(':id/checkin')
  async checkin(@Param('id') id: string) {
    return this.habitService.checkin(id);
  }

  @NeedLogin()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.habitService.remove(id);
  }
}
