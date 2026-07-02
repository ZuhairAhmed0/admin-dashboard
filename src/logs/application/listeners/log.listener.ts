import { Injectable } from '@nestjs/common';
import { CreateLogUseCase } from '../use-cases/create-log.use-case';
import { OnEvent } from '@nestjs/event-emitter';
import { LogEntity } from 'src/logs/domain/entities/log.entity';

@Injectable()
export class LogListener {
  constructor(private readonly createLogUseCase: CreateLogUseCase) {}
  @OnEvent('log.created')
  async handleLogCreatedEvent(event: Partial<LogEntity>) {
    const log = new LogEntity();

    log.action = event.action;
    log.performedBy = event.performedBy;
    log.details = event.details;
    log.ip = event.ip;

    await this.createLogUseCase.execute(log);
  }
}
