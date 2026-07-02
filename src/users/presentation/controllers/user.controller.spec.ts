import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.use-case';
import { UpdateStatusUseCase } from '../../application/use-cases/update-status.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { Role } from '../../../shared/enums/Role';

describe('UserController', () => {
  let controller: UserController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let getUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>;
  let updateRoleUseCase: jest.Mocked<UpdateRoleUseCase>;
  let updateStatusUseCase: jest.Mocked<UpdateStatusUseCase>;
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
  let getAllUsersUseCase: jest.Mocked<GetAllUsersUseCase>;
  let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

  beforeEach(async () => {
    const mockCreateUserUseCase = { execute: jest.fn() };
    const mockGetUserProfileUseCase = { execute: jest.fn() };
    const mockUpdateRoleUseCase = { execute: jest.fn() };
    const mockUpdateStatusUseCase = { execute: jest.fn() };
    const mockUpdateUserUseCase = { execute: jest.fn() };
    const mockGetAllUsersUseCase = { execute: jest.fn() };
    const mockDeleteUserUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
        { provide: GetUserProfileUseCase, useValue: mockGetUserProfileUseCase },
        { provide: UpdateRoleUseCase, useValue: mockUpdateRoleUseCase },
        { provide: UpdateStatusUseCase, useValue: mockUpdateStatusUseCase },
        { provide: UpdateUserUseCase, useValue: mockUpdateUserUseCase },
        { provide: GetAllUsersUseCase, useValue: mockGetAllUsersUseCase },
        { provide: DeleteUserUseCase, useValue: mockDeleteUserUseCase },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUserUseCase = module.get(CreateUserUseCase);
    getUserProfileUseCase = module.get(GetUserProfileUseCase);
    updateRoleUseCase = module.get(UpdateRoleUseCase);
    updateStatusUseCase = module.get(UpdateStatusUseCase);
    updateUserUseCase = module.get(UpdateUserUseCase);
    getAllUsersUseCase = module.get(GetAllUsersUseCase);
    deleteUserUseCase = module.get(DeleteUserUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call getAllUsersUseCase', async () => {
    const filter = { page: 1, limit: 10 } as any;
    getAllUsersUseCase.execute.mockResolvedValue([] as any);
    await controller.findAll(filter);
    expect(getAllUsersUseCase.execute).toHaveBeenCalledWith(filter);
  });

  it('create should call createUserUseCase', async () => {
    const dto = { name: 't', email: 't@t.com', password: '123' } as any;
    createUserUseCase.execute.mockResolvedValue({ id: '1' } as any);
    await controller.create(dto);
    expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findById should call getUserProfileUseCase', async () => {
    getUserProfileUseCase.execute.mockResolvedValue({ id: '1' } as any);
    await controller.findById('1');
    expect(getUserProfileUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('updateRole should call updateRoleUseCase', async () => {
    const dto = { role: Role.ADMIN };
    updateRoleUseCase.execute.mockResolvedValue({ id: '1' } as any);
    await controller.updateRole('1', dto);
    expect(updateRoleUseCase.execute).toHaveBeenCalledWith('1', Role.ADMIN);
  });

  it('updateStatus should call updateStatusUseCase', async () => {
    const dto = { status: 'active' as any };
    updateStatusUseCase.execute.mockResolvedValue({ id: '1' } as any);
    await controller.updateStatus('1', dto);
    expect(updateStatusUseCase.execute).toHaveBeenCalledWith('1', 'active');
  });

  it('updateUser should call updateUserUseCase', async () => {
    const dto = { name: 'new name' };
    updateUserUseCase.execute.mockResolvedValue({ id: '1' } as any);
    await controller.updateUser('1', dto);
    expect(updateUserUseCase.execute).toHaveBeenCalledWith('1', dto);
  });

  it('deleteUser should call deleteUserUseCase', async () => {
    deleteUserUseCase.execute.mockResolvedValue(undefined);
    await controller.deleteUser('1');
    expect(deleteUserUseCase.execute).toHaveBeenCalledWith('1');
  });
});
