import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
  async getHistory(@Headers('x-user-id') userId?: string): Promise<FocusSessionRecord[]> {
    return await this.focusService.getHistory(userId);
  }

  @Post('history')
  @ApiOperation({ summary: 'Create new focus session record' })
  async createSession(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateSessionDto,
  ): Promise<FocusSessionRecord> {
    return await this.focusService.createSession(dto, userId);
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
  async updateDailyGoal(@Headers('x-user-id') userId: string, @Body() dto: UpdateGoalDto) {
    const updated = await this.focusService.updateDailyGoal(dto, userId);
    return { dailyGoalMinutes: updated };
  }
}
