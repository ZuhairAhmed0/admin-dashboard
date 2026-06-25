import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
