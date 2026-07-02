import { Inject, Injectable } from '@nestjs/common';
import {
  IUSER_REPOSITORY,
  IUserRepository,
} from '../../domain/interfaces/user.repository';
import { FilterUserDto } from '../../presentation/dto/filter-user.dto';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { UserResponseDto } from '../../..//shared/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    dto?: FilterUserDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const { users, total } = await this.userRepo.findAll(
      {
        role: dto.role,
        status: dto.status,
        search: dto.search,
      },
      skip,
      limit,
    );

    const usersResponse = plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });

    return {
      data: usersResponse,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
