import { UpdateRoleUseCase } from './update-role.use-case';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../../../shared/enums/Role';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe('UpdateRoleUseCase', () => {
  let useCase: UpdateRoleUseCase;

  beforeEach(() => {
    useCase = new UpdateRoleUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('1', Role.ADMIN)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('should update user role if user is found', async () => {
    const mockUser = { id: '1', role: Role.USER } as any;
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue({ ...mockUser, role: Role.ADMIN });

    const result = await useCase.execute('1', Role.ADMIN);

    expect(result.role).toBe(Role.ADMIN);
    expect(mockUserRepo.findById).toHaveBeenCalledWith('1');
    expect(mockUserRepo.update).toHaveBeenCalledWith('1', { role: Role.ADMIN });
  });
});
