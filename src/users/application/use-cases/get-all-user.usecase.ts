import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';
import { FilterUserDto } from '../../presentation/dto/filter-user.dto';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(filter?: FilterUserDto): Promise<User[]> {
    const query: Partial<User> = {};

    if (filter?.role) query.role = filter.role;
    if (filter?.status) query.status = filter.status;
    if (filter?.name) query.name = filter.name;

    const users = await this.userRepo.findAll(query);

    return users;
  }
}
