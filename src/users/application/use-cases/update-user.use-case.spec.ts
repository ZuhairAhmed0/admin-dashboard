import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { NotFoundException } from '@nestjs/common';
import { Status } from '../../domain/enums/Status';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    useCase = new UpdateUserUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('1', {})).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user is DELETED', async () => {
    mockUserRepo.findById.mockResolvedValue({
      id: '1',
      status: Status.DELETED,
    } as any);

    await expect(useCase.execute('1', {})).rejects.toThrow(NotFoundException);
  });

  it('should update user data if user exists and is not DELETED', async () => {
    const mockUser = {
      id: '1',
      name: 'Old Name',
      status: Status.ACTIVE,
    } as any;
    const updateDto = { name: 'New Name' } as UpdateUserDto;

    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.update.mockResolvedValue({ ...mockUser, ...updateDto });

    const result = await useCase.execute('1', updateDto);

    expect(result.name).toBe('New Name');
    expect(mockUserRepo.update).toHaveBeenCalledWith('1', updateDto);
  });
});
