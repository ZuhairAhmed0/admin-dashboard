import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.use-case';
import { UpdateStatusUseCase } from '../../application/use-cases/update-status.use-case';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-user.use-case';
import { FilterUserDto } from '../dto/filter-user.dto';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Role } from '../../../shared/enums/Role';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../../../shared/dto/user-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import {
  CurrentUser,
  ActiveUserData,
} from '../../../shared/decorators/current-user.decorator';

@ApiTags('Users Management')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden - Requires Admin role' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Users fetched successfully',
    type: [UserResponseDto],
  })
  @Get()
  async findAll(@Query() filter: FilterUserDto) {
    return this.getAllUsersUseCase.execute(filter);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @Req() req: Request,
    @CurrentUser() admin: ActiveUserData,
  ) {
    const user = await this.createUserUseCase.execute(dto);
    this.eventEmitter.emit('log.created', {
      action: 'CREATE_USER',
      performedBy: admin.id,
      details: `Created new user with email: ${dto.email}`,
      ip: req.ip,
    });
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({
    description: 'User fetched successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.getUserProfileUseCase.execute(id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Update role' })
  @ApiOkResponse({
    description: 'Role updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id/role')
  async updateRole(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() admin: ActiveUserData,
  ) {
    const user = await this.updateRoleUseCase.execute(id, dto.role);
    this.eventEmitter.emit('log.created', {
      action: 'UPDATE_USER_ROLE',
      performedBy: admin.id,
      details: `Changed role to ${dto.role} for user ID: ${id}`,
      ip: req.ip,
    });
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Update status' })
  @ApiOkResponse({
    description: 'Status updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() admin: ActiveUserData,
  ) {
    const user = await this.updateStatusUseCase.execute(id, dto.status);
    this.eventEmitter.emit('log.created', {
      action: 'UPDATE_USER_STATUS',
      performedBy: admin.id,
      details: `Changed status to ${dto.status} for user ID: ${id}`,
      ip: req.ip,
    });
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  async updateUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() admin: ActiveUserData,
  ) {
    const user = await this.updateUserUseCase.execute(id, dto);
    this.eventEmitter.emit('log.created', {
      action: 'UPDATE_USER',
      performedBy: admin.id,
      details: `Updated details for user ID: ${id}`,
      ip: req.ip,
    });
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete(':id')
  async deleteUser(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() admin: ActiveUserData,
  ) {
    await this.deleteUserUseCase.execute(id);
    this.eventEmitter.emit('log.created', {
      action: 'DELETE_USER',
      performedBy: admin.id,
      details: `Deleted user with ID: ${id}`,
      ip: req.ip,
    });
    return { message: 'User deleted successfully' };
  }
}
