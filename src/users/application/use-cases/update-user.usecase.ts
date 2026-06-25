import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  IUSER_REPOSITORY,
} from '../../domain/interfaces/user.repository';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { User } from '../../domain/entities/user.entity';
import { Status } from '../../domain/enums/Status';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findById(id);

    if (!user || user.status === Status.DELETED)
      throw new NotFoundException('User not found');

    const updatedUser = await this.userRepo.update(id, data);
    return updatedUser;
  }
}
