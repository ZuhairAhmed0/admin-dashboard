import { Module, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.validation';
import { postgresConfig } from './config/db.config';
import { appConfig } from './config/app.config';
import { UsersModule } from './users/users.module';
import { SecurityModule } from './shared/security/security.module';
import { jwtConfig } from './config/jwt.config';
import { AuthModule } from './auth/auth.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { LoggerModule } from './shared/logger/logger.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LogsModule } from './logs/logs.module';
import * as path from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      load: [postgresConfig, appConfig, jwtConfig],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
      skipIf: (context: ExecutionContext) => {
        // Skip throttling for OPTIONS (CORS preflight) requests
        const request = context.switchToHttp().getRequest<Request>();
        return request.method === 'OPTIONS';
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    SecurityModule,
    UploadModule,
    LogsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
