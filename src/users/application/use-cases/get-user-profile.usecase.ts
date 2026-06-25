import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';
import { Status } from '../../domain/enums/Status';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);

    if (!user || user.status === Status.DELETED) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
