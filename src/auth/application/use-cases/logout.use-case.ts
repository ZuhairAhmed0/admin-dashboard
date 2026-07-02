import { Injectable, Inject } from '@nestjs/common';
import {
  IUserRepository,
  IUSER_REPOSITORY,
} from '../../../users/domain/interfaces/user.repository';
import {
  ITokenProvider,
  I_TOKEN_PROVIDER,
} from '../../../shared/security/interfaces/token.provider';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(I_TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    try {
      const payload = this.tokenProvider.verifyRefreshToken(refreshToken);

      await this.userRepository.update(payload.userId, { refreshToken: null });
    } catch {
      // If token is invalid or expired, we don't throw an error because
      // the goal of logout is to invalidate the session anyway.
    }
  }
}
