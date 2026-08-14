import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง';

    if (exception instanceof HttpException) {
      const resObj = exception.getResponse();
      if (typeof resObj === 'string') {
        message = resObj;
      } else if (typeof resObj === 'object' && resObj !== null) {
        message = (resObj as any).message || resObj;
      }
    } else if (exception instanceof Error) {
      // Log internal server error silently for developer diagnostics
      this.logger.error(`Internal Exception: ${exception.message}`, exception.stack);
    }

    // Ensure no sensitive info (tokens, DB strings, stack traces) leaks to client response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
