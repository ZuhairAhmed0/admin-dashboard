import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '../../domain/enums/Status';
import { User } from '../../domain/entities/user.entity';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';

@Injectable()
export class UpdateStatusUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string, status: Status): Promise<User> {
    const user = await this.userRepo.findById(id);

    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.userRepo.update(id, { status });

    return updatedUser;
  }
}
