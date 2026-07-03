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
  const NODE_ENV = config.get<string>('app.env');

  // for enable cors
  const allowedOrigins = [
    'http://localhost:3000', // React / Next.js
    'http://localhost:5173', // Vite
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // In development, allow all origins
      if (NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }

      // In production, check against whitelist
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    credentials: true,
    maxAge: 3600,
  });

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

  // for cookie parser
  app.use(cookieParser());

  // Redirect root path and /api to api-docs
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/api' || req.path === '/api/') {
      return res.redirect('/api-docs');
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
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT Token',
    })
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Refresh Token stored in cookies',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(PORT);
}
bootstrap().catch(console.error);
