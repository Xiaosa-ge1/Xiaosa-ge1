import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { PlanService } from './plan.service';
import type { CreatePlanRequest, UpdatePlanRequest, BatchCreatePlansRequest } from '@shared/api.interface';

@Controller('api/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  async findByDate(@Query('date') date: string) {
    return this.planService.findByDate(date);
  }

  @NeedLogin()
  @Post('batch')
  async batchCreate(@Body() body: BatchCreatePlansRequest, @Req() req: { userContext: { userId: string } }) {
    return this.planService.batchCreate(body.plans, req.userContext.userId);
  }

  @NeedLogin()
  @Post()
  async create(@Body() body: CreatePlanRequest, @Req() req: { userContext: { userId: string } }) {
    return this.planService.create(body, req.userContext.userId);
  }

  @NeedLogin()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePlanRequest) {
    return this.planService.update(id, body);
  }

  @NeedLogin()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}
