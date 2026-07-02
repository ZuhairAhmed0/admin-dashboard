import { UpdateStatusUseCase } from './update-status.use-case';
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

describe('UpdateStatusUseCase', () => {
  let useCase: UpdateStatusUseCase;

  beforeEach(() => {
    useCase = new UpdateStatusUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('1', Status.ACTIVE)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if user is DELETED', async () => {
    mockUserRepo.findById.mockResolvedValue({
      id: '1',
      status: Status.DELETED,
    } as any);

    await expect(useCase.execute('1', Status.ACTIVE)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });

  it('should update user status if user exists and is not DELETED', async () => {
    const mockUser = { id: '1', status: Status.SUSPEND } as any;
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue({
      ...mockUser,
      status: Status.ACTIVE,
    });

    const result = await useCase.execute('1', Status.ACTIVE);

    expect(result.status).toBe(Status.ACTIVE);
    expect(mockUserRepo.update).toHaveBeenCalledWith('1', {
      status: Status.ACTIVE,
    });
  });
});
