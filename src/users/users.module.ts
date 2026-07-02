import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserController } from './presentation/controllers/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { IUSER_REPOSITORY } from './domain/interfaces/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-user.use-case';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case';
import { UpdateStatusUseCase } from './application/use-cases/update-status.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserProfileUseCase,
    GetAllUsersUseCase,
    UpdateRoleUseCase,
    UpdateStatusUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    {
      provide: IUSER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [IUSER_REPOSITORY],
})
export class UsersModule {}
