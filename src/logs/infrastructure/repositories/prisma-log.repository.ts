import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { LogEntity } from '../../domain/entities/log.entity';
import { ILogRepository } from '../../domain/interfaces/log.repository';

@Injectable()
export class PrismaLogRepository implements ILogRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async save(log: LogEntity): Promise<void> {
    await this.prisma.log.create({
      data: {
        action: log.action,
        details: log.details,
        performedBy: log.performedBy,
        ip: log.ip,
      },
    });
  }

  async findAll(userId: string, action: string): Promise<LogEntity[]> {
    const query: { performedBy?: string; action?: string } = {};

    if (userId) query.performedBy = userId;
    if (action) query.action = action;

    const logs = await this.prisma.log.findMany({ where: query || undefined });

    return logs;
  }
}
