import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppLogger } from './shared/logger/app.logger';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  // Port
  const config = app.get(ConfigService);
  const PORT = config.get<number>('app.port');

  // for adding security headers
  const isProduction = config.get<string>('app.env') === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? undefined // strict defaults in production
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
              scriptSrc: ["'self'", "https: 'unsafe-inline'"],
            },
          },
    }),
  );

  // for enable cors
  app.enableCors(
    (req: Request, callback: (err: Error | null, options?: any) => void) => {
      const origin = req.header('Origin');
      const host = req.header('Host');

      const allowedOrigins = [
        'http://localhost:3000', // React / Next.js
        'http://localhost:5173', // Vite
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        `http://localhost:${PORT}`, // Backend local
        `http://127.0.0.1:${PORT}`,
      ];

      // Add production allowed origins from environment variable if defined (e.g. your production frontend URL)
      const prodOrigins = process.env.ALLOWED_ORIGINS;
      if (prodOrigins) {
        allowedOrigins.push(...prodOrigins.split(',').map((o) => o.trim()));
      }

      // Automatically allow same-origin requests (like Swagger running on the backend URL on Render/Local)
      const isSameOrigin =
        origin && host && origin.replace(/^https?:\/\//, '') === host;

      if (!origin || isSameOrigin || allowedOrigins.includes(origin)) {
        callback(null, {
          origin: true,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          credentials: true,
        });
      } else {
        callback(null, { origin: false });
      }
    },
  );

  // for cookie parser
  app.use(cookieParser());

  // Redirect root path and /api to api-docs
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/' || req.path === '/api' || req.path === '/api/') {
      res.redirect('/api-docs');
      return;
    }
    next();
  });

  // for setting global prefix
  app.setGlobalPrefix('api');

  // for global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // for logger
  app.useLogger(app.get(AppLogger));

  // for swagger api docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Admin Dashboard')
    .setDescription('Admin Dashboard API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(PORT);
}
bootstrap().catch(console.error);
