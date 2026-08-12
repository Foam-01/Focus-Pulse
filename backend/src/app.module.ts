import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FocusModule } from './modules/focus/focus.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { VideosModule } from './modules/videos/videos.module';

@Module({
  imports: [PrismaModule, FocusModule, AnalyticsModule, VideosModule],
})
export class AppModule {}
