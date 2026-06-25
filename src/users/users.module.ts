import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserController } from './presentation/controllers/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { IUSER_REPOSITORY } from './domain/interfaces/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.usecase';
import { GetAllUsersUseCase } from './application/use-cases/get-all-user.usecase';
import { UpdateRoleUseCase } from './application/use-cases/update-role.usecase';
import { UpdateStatusUseCase } from './application/use-cases/update-status.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';

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
  exports: [],
})
export class UsersModule {}
