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
    let details: unknown = undefined;

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
      message = exception.message || 'Internal server error';
      error = exception.name || 'InternalServerError';
      details = exception.stack; // Include stack trace for debugging
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';
      details = String(exception); // Log the actual exception
    }

    // Log all exceptions: warn for 4xx, error for 5xx
    if (statusCode >= 500) {
      const isError = exception instanceof Error;
      this.logger.error(
        `${method} ${url} - ${statusCode} - ${error}: ${Array.isArray(message) ? message.join(', ') : message}`,
        isError ? exception.stack : String(exception),
      );
    } else {
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
      ...(process.env.NODE_ENV !== 'production' && details && { details }), // Include details in dev mode
    };

    response.status(statusCode).json(errorResponse);
  }
}
