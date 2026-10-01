import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { FocusService, FocusSessionRecord } from './focus.service';
import { CreateSessionDto, UpdateGoalDto, UpdateSessionDto } from './dto/create-session.dto';

@ApiTags('Focus Sessions')
@ApiSecurity('x-user-id')
@Controller('focus')
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get user focus history records' })
  async getHistory(
    @Headers('x-user-id') userId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ): Promise<FocusSessionRecord[]> {
    // page/pageSize/tag/search are all OPTIONAL — omitting them preserves the
    // original unbounded, unfiltered response exactly as before.
    const pageNum = page !== undefined ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize !== undefined ? parseInt(pageSize, 10) : undefined;
    return await this.focusService.getHistory(
      userId,
      Number.isFinite(pageNum) ? pageNum : undefined,
      Number.isFinite(pageSizeNum) ? pageSizeNum : undefined,
      tag,
      search,
    );
  }

  @Get('history/stats')
  @ApiOperation({ summary: 'Get aggregate focus history stats (count/sum/per-tag) without downloading all rows' })
  async getHistoryStats(
    @Headers('x-user-id') userId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return await this.focusService.getHistoryStats(userId, tag, search);
  }

  @Post('history')
  @ApiOperation({ summary: 'Create new focus session record' })
  async createSession(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-email') userEmail: string,
    @Body() dto: CreateSessionDto,
  ): Promise<FocusSessionRecord> {
    return await this.focusService.createSession(dto, userId, userEmail);
  }

  @Delete('history/:id')
  async deleteSession(@Headers('x-user-id') userId: string, @Param('id') id: string) {
    const success = await this.focusService.deleteSession(id, userId);
    if (!success) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }
    return { success: true, message: 'Deleted successfully' };
  }

  @Post('history/:id')
  async updateSessionPost(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    const updated = await this.focusService.updateSession(id, dto, userId);
    if (!updated) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }
    return updated;
  }

  @Delete('history')
  @HttpCode(HttpStatus.OK)
  async resetAllHistory(@Headers('x-user-id') userId?: string) {
    await this.focusService.resetAllHistory(userId);
    return { success: true, message: 'All history reset successfully' };
  }

  @Get('goal')
  async getDailyGoal(@Headers('x-user-id') userId?: string) {
    const goal = await this.focusService.getDailyGoal(userId);
    return { dailyGoalMinutes: goal };
  }

  @Post('goal')
  async updateDailyGoal(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-email') userEmail: string,
    @Body() dto: UpdateGoalDto,
  ) {
    const updated = await this.focusService.updateDailyGoal(dto, userId, userEmail);
    return { dailyGoalMinutes: updated };
  }
}
