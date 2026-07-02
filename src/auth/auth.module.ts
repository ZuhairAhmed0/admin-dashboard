import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controller/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { UsersModule } from '../users/users.module';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { JwtStrategy } from './infrastructure/auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';

@Module({
  imports: [UsersModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
    ChangePasswordUseCase,
  ],
  exports: [],
})
export class AuthModule {}
