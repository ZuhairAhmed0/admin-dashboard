import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppLogger } from './shared/logger/app.logger';

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
  const allowedOrigins = [
    'http://localhost:3000', // React / Next.js
    'http://localhost:5173', // Vite
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // for cookie parser
  app.use(cookieParser());

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
