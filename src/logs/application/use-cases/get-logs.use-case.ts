import { Inject, Injectable } from '@nestjs/common';
import { LogEntity } from '../../domain/entities/log.entity';
import {
  ILOG_REPOSITORY,
  ILogRepository,
} from '../../domain/interfaces/log.repository';

@Injectable()
export class GetLogsUseCase {
  constructor(
    @Inject(ILOG_REPOSITORY) private readonly logRepo: ILogRepository,
  ) {}

  async execute(userId: string, action: string): Promise<LogEntity[]> {
    const logs = this.logRepo.findAll(userId, action);

    return logs;
  }
}
