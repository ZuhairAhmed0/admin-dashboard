import { GetUserProfileUseCase } from './get-user-profile.use-case';
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

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;

  beforeEach(() => {
    useCase = new GetUserProfileUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid_id')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockUserRepo.findById).toHaveBeenCalledWith('invalid_id');
  });

  it('should throw NotFoundException if user is deleted', async () => {
    mockUserRepo.findById.mockResolvedValue({
      id: '1',
      status: Status.DELETED,
    } as any);

    await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
    expect(mockUserRepo.findById).toHaveBeenCalledWith('1');
  });

  it('should return user profile if found and not deleted', async () => {
    const mockUser = {
      id: '1',
      name: 'Zuhair',
      email: 'test@test.com',
      status: Status.ACTIVE,
    } as any;
    mockUserRepo.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute('1');

    expect(result).toEqual(mockUser);
    expect(mockUserRepo.findById).toHaveBeenCalledWith('1');
  });
});
