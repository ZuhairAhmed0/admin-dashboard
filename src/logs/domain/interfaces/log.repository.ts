import { LogEntity } from '../entities/log.entity';

export interface ILogRepository {
  save(log: LogEntity): Promise<void>;
  findAll(userId?: string, action?: string): Promise<LogEntity[]>;
}

export const ILOG_REPOSITORY = 'ILOG_REPOSITORY';
