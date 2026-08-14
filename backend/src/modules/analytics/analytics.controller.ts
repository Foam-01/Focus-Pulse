import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiSecurity('x-user-id')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get focus statistics & chart data summary' })
  async getSummary(
    @Headers('x-user-id') userId?: string,
    @Query('timeframe') timeframe: 'day' | 'week' | 'month' = 'day',
  ) {
    return await this.analyticsService.getSummary(userId, timeframe);
  }
}
