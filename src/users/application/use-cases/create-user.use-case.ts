import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import {
  I_HASH_PROVIDER,
  IHashProvider,
} from '../../../shared/security/interfaces/hash.provider';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(I_HASH_PROVIDER) private readonly hashProvider: IHashProvider,
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    const user = await this.userRepo.findByEmail(data.email);

    if (user) throw new BadRequestException('User already exists');

    const hashedPassword = await this.hashProvider.hash(data.password);

    const newUser = await this.userRepo.save({
      ...data,
      password: hashedPassword,
    });
    return newUser;
  }
}
