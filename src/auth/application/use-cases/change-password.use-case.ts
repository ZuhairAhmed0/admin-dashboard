import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Status } from '../../../users/domain/enums/Status';
import {
  IHashProvider,
  I_HASH_PROVIDER,
} from '../../../shared/security/interfaces/hash.provider';
import {
  ITokenProvider,
  I_TOKEN_PROVIDER,
} from '../../../shared/security/interfaces/token.provider';
import {
  IUserRepository,
  IUSER_REPOSITORY,
} from '../../../users/domain/interfaces/user.repository';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly usersRepository: IUserRepository,
    @Inject(I_HASH_PROVIDER) private readonly hashProvider: IHashProvider,
    @Inject(I_TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(userId: string, oldPassword: string, newPassword: string) {
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    const user = await this.usersRepository.findById(userId);
    if (!user || user.status === Status.DELETED) {
      throw new NotFoundException('User not found');
    }

    if (user.status === Status.SUSPEND) {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support.',
      );
    }
    const isOldPasswordValid = await this.hashProvider.compare(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const accessToken = this.tokenProvider.generateToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = this.tokenProvider.refreshToken({
      userId: user.id,
      role: user.role,
    });

    const newPasswordHash = await this.hashProvider.hash(newPassword);
    const hashedRefreshToken = await this.hashProvider.hash(refreshToken);

    await this.usersRepository.update(userId, {
      password: newPasswordHash,
      refreshToken: hashedRefreshToken,
    });

    return { accessToken, refreshToken };
  }
}
