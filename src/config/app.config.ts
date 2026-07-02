import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  cookieMaxAge: Number(process.env.REFRESH_TOKEN_COOKIE_MS),
}));
