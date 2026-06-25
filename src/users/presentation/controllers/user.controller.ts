import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.usecase';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.usecase';
import { UpdateStatusUseCase } from '../../application/use-cases/update-status.usecase';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.usecase';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-user.usecase';
import { FilterUserDto } from '../dto/filter-user.dto';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly updateStatusUseCase: UpdateStatusUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  async findAll(@Query() filter: FilterUserDto) {
    return this.getAllUsersUseCase.execute(filter);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.getUserProfileUseCase.execute(id);
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, dto.role);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.updateStatusUseCase.execute(id, dto.status);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.deleteUserUseCase.execute(id);
  }
}
