import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  async getSummary(@Query('timeframe') timeframe: 'day' | 'week' | 'month' = 'day') {
    return await this.analyticsService.getSummary(timeframe);
  }
}
