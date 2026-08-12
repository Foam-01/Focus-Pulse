import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FocusService, FocusSessionRecord } from './focus.service';
import { CreateSessionDto, UpdateGoalDto } from './dto/create-session.dto';

@Controller('focus')
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Get('history')
  async getHistory(): Promise<FocusSessionRecord[]> {
    return await this.focusService.getHistory();
  }

  @Post('history')
  async createSession(@Body() dto: CreateSessionDto): Promise<FocusSessionRecord> {
    return await this.focusService.createSession(dto);
  }

  @Delete('history/:id')
  async deleteSession(@Param('id') id: string) {
    const success = await this.focusService.deleteSession(id);
    if (!success) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }
    return { success: true, message: 'Deleted successfully' };
  }

  @Delete('history')
  @HttpCode(HttpStatus.OK)
  async resetAllHistory() {
    await this.focusService.resetAllHistory();
    return { success: true, message: 'All history reset successfully' };
  }

  @Get('goal')
  async getDailyGoal() {
    const goal = await this.focusService.getDailyGoal();
    return { dailyGoalMinutes: goal };
  }

  @Post('goal')
  async updateDailyGoal(@Body() dto: UpdateGoalDto) {
    const updated = await this.focusService.updateDailyGoal(dto);
    return { dailyGoalMinutes: updated };
  }
}
