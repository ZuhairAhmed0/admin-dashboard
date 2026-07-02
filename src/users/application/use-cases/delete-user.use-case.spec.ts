import { DeleteUserUseCase } from './delete-user.use-case';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { NotFoundException } from '@nestjs/common';
import { Status } from '../../domain/enums/Status';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;

  beforeEach(() => {
    useCase = new DeleteUserUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if user does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('should update user status to DELETED if user exists', async () => {
    const mockUser = { id: '1', status: Status.ACTIVE } as any;
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue({
      ...mockUser,
      status: Status.DELETED,
    });

    await useCase.execute('1');

    expect(mockUserRepo.findById).toHaveBeenCalledWith('1');
    expect(mockUserRepo.update).toHaveBeenCalledWith('1', {
      status: Status.DELETED,
    });
  });
});
