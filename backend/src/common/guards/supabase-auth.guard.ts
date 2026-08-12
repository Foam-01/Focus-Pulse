import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL || 'https://eszksuagxvqgryweiwtn.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzemtzdWFneHZxZ3J5d2Vpd3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MTYyOTMsImV4cCI6MjEwMjA5MjI5M30.fVOkfjFmQ8yBgwTIE8ttW_79ZYEOjQkw55Xbu5L0_UQ',
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = { id: 'anonymous' };
      return true;
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('JWT Token ไม่ถูกต้อง หรือ เซสชันหมดอายุแล้ว');
    }

    request.user = data.user;
    return true;
  }
}
