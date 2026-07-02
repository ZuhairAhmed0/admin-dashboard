import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();

    let statusCode: number;
    let message: string;
    let error: string;

    switch (exception.code) {
      case 'P2002': {
        statusCode = HttpStatus.CONFLICT;
        const fields =
          (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `A record with this ${fields} already exists`;
        error = 'Conflict';
        break;
      }

      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        error = 'Not Found';
        break;

      case 'P2003':
        statusCode = HttpStatus.BAD_REQUEST;
        message =
          'Cannot delete or modify this record because it is referenced by other records';
        error = 'Bad Request';
        break;

      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'A database error occurred';
        error = 'Internal Server Error';
        break;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      error,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(errorResponse);
  }
}
