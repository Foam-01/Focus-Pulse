import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD format (e.g. 2026-08-12)

  @IsOptional()
  @IsString()
  time?: string; // HH:MM format (e.g. 14:30)

  @IsNumber()
  @Min(1)
  @Max(480)
  duration: number; // Focus duration in minutes

  @IsOptional()
  @IsString()
  tag?: string; // Optional session category or tag
}

export class UpdateGoalDto {
  @IsNumber()
  @Min(30)
  @Max(1440)
  dailyGoalMinutes: number;
}
