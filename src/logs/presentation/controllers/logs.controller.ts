import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetLogsUseCase } from '../../application/use-cases/get-logs.use-case';
import { JwtAuthGuard } from 'src/auth/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/Role';
import { plainToInstance } from 'class-transformer';
import { LogResponseDto } from '../dto/log-response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
export class LogsController {
  constructor(private readonly getLogsUseCase: GetLogsUseCase) {}

  @Get('')
  async getAllLogs(@Query() query: { userId: string; action: string }) {
    const logs = await this.getLogsUseCase.execute(query.userId, query.action);

    return plainToInstance(LogResponseDto, logs, {
      excludeExtraneousValues: true,
    });
  }
}
