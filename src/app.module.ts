import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.validation';
import { postgresConfig } from './config/db.config';
import { appConfig } from './config/app.config';
import { UsersModule } from './users/users.module';
import { SecurityModule } from './shared/security/security.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      load: [postgresConfig, appConfig],
    }),
    UsersModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
