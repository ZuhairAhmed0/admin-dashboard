import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../../users/domain/interfaces/user.repository';
import { UserResponseDto } from '../../../shared/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { Status } from '../../../users/domain/enums/Status';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status === Status.DELETED) {
      throw new NotFoundException('User not found');
    }

    if (user.status === Status.SUSPEND) {
      throw new NotFoundException(
        'Your account has been suspended. Please contact support.',
      );
    }
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
