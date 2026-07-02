import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';
import { Status } from '../../domain/enums/Status';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(`User with ID "${id}" not found`);
    await this.userRepo.update(id, { status: Status.DELETED });
  }
}
