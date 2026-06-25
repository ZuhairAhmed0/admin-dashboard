import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/Role';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string, role: Role): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const updateUser = await this.userRepo.update(id, { role });

    return updateUser;
  }
}
