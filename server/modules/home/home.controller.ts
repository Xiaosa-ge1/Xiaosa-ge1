import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('api/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('today-plans')
  async getTodayPlans() {
    return this.homeService.getTodayPlans();
  }

  @Get('today-checkin')
  async getTodayCheckin() {
    return this.homeService.getTodayCheckin();
  }

  @Get('recent-diaries')
  async getRecentDiaries() {
    return this.homeService.getRecentDiaries();
  }
}
