import { Controller, Get, Query, Headers } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  async getSummary(
    @Headers('x-user-id') userId?: string,
    @Query('timeframe') timeframe: 'day' | 'week' | 'month' = 'day',
  ) {
    return await this.analyticsService.getSummary(userId, timeframe);
  }
}
