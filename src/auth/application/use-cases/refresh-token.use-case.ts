import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ITokenProvider,
  I_TOKEN_PROVIDER,
  PayloadToken,
} from '../../../shared/security/interfaces/token.provider';
import {
  IHashProvider,
  I_HASH_PROVIDER,
} from '../../../shared/security/interfaces/hash.provider';
import {
  IUserRepository,
  IUSER_REPOSITORY,
} from '../../../users/domain/interfaces/user.repository';
import { UserResponseDto } from '../../../shared/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { Status } from '../../../users/domain/enums/Status';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(I_TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    @Inject(I_HASH_PROVIDER) private readonly hashProvider: IHashProvider,
  ) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    let payload: PayloadToken;
    try {
      payload = this.tokenProvider.verifyRefreshToken(refreshToken);
    } catch {
      throw new BadRequestException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user || !user.refreshToken || user.status === Status.DELETED) {
      throw new ForbiddenException('Invalid refresh token');
    }

    if (user.status === Status.SUSPEND) {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact support.',
      );
    }

    const isTokenValid = await this.hashProvider.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isTokenValid) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const newAccessToken = this.tokenProvider.generateToken({
      userId: user.id,
      role: user.role,
    });

    const newRefreshToken = this.tokenProvider.refreshToken({
      userId: user.id,
      role: user.role,
    });

    const hashedRefreshToken = await this.hashProvider.hash(newRefreshToken);

    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
