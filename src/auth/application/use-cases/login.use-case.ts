import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  ITokenProvider,
  I_TOKEN_PROVIDER,
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
export class LoginUseCase {
  constructor(
    @Inject(I_TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    @Inject(I_HASH_PROVIDER) private readonly hashProvider: IHashProvider,
    @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.status === Status.DELETED) {
      throw new ForbiddenException('Invalid credentials');
    }

    if (user.status === Status.SUSPEND) {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact support.',
      );
    }

    const isPasswordValid = await this.hashProvider.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const accessToken = this.tokenProvider.generateToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = this.tokenProvider.refreshToken({
      userId: user.id,
      role: user.role,
    });

    const hashedRefreshToken = await this.hashProvider.hash(refreshToken);

    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
