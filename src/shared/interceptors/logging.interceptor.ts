import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { AppLogger } from '../logger/app.logger';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const user = request.user as { id: string; role: string };

    const now = Date.now();

    this.logger.log(
      `➡️ ${method} ${url} - User: ${user?.id || 'anonymous'} - IP: ${ip}`,
      'LoggingInterceptor',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const statusCode = response.statusCode;
          const elapsed = Date.now() - now;

          this.logger.log(
            `⬅️ ${method} ${url} - ${statusCode} - ${elapsed}ms`,
            'LoggingInterceptor',
          );
        },
        error: (error: { message: string; stack: string }) => {
          const elapsed = Date.now() - now;
          this.logger.error(
            `❌ ${method} ${url} - Error: ${error.message} - ${elapsed}ms`,
            error.stack,
            'LoggingInterceptor',
          );
        },
      }),
    );
  }
}
