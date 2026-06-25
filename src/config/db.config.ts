import { registerAs } from '@nestjs/config';

export const postgresConfig = registerAs('db', () => ({
  url: process.env.DATABASE_URL,
}));
