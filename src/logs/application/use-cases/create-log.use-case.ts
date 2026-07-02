import { Inject, Injectable } from '@nestjs/common';
import { LogEntity } from '../../domain/entities/log.entity';
import {
  ILOG_REPOSITORY,
  ILogRepository,
} from '../../domain/interfaces/log.repository';

@Injectable()
export class CreateLogUseCase {
  constructor(
    @Inject(ILOG_REPOSITORY) private readonly logRepo: ILogRepository,
  ) {}

  async execute(log: LogEntity): Promise<void> {
    return await this.logRepo.save(log);
  }
}
