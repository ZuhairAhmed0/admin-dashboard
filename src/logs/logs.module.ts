import { Module } from '@nestjs/common';
import { LogsController } from './presentation/controllers/logs.controller';
import { CreateLogUseCase } from './application/use-cases/create-log.use-case';
import { GetLogsUseCase } from './application/use-cases/get-logs.use-case';
import { ILOG_REPOSITORY } from './domain/interfaces/log.repository';
import { PrismaLogRepository } from './infrastructure/repositories/prisma-log.repository';
import { DatabaseModule } from 'src/database/database.module';
import { LogListener } from './application/listeners/log.listener';

@Module({
  imports: [DatabaseModule],
  controllers: [LogsController],
  providers: [
    CreateLogUseCase,
    GetLogsUseCase,
    LogListener,
    {
      provide: ILOG_REPOSITORY,
      useClass: PrismaLogRepository,
    },
  ],
})
export class LogsModule {}
