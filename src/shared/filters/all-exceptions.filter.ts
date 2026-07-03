import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;

    let statusCode: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else {
        const body = res as Record<string, unknown>;
        message = (body.message as string | string[]) || exception.message;
        error = (body.error as string) || exception.name;
      }
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      error = exception.name || 'InternalServerError';
      message = 'Internal server error'; // Generic message for response

      // Log detailed error to console
      this.logger.error(
        `${method} ${url} - ${statusCode} - ${error}: ${exception.message}`,
        exception.stack,
      );
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      // Log unknown exception
      this.logger.error(
        `${method} ${url} - ${statusCode} - ${error}`,
        String(exception),
      );
    }

    // Log 4xx errors as warnings, skip if already logged above
    if (!(exception instanceof Error) && statusCode < 500) {
      this.logger.warn(
        `${method} ${url} - ${statusCode} - ${error}: ${Array.isArray(message) ? message.join(', ') : message}`,
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(errorResponse);
  }
}
