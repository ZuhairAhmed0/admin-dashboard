import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { IHashProvider } from '../../../shared/security/interfaces/hash.provider';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

const mockHashProvider: jest.Mocked<IHashProvider> = {
  hash: jest.fn(),
  compare: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    useCase = new CreateUserUseCase(mockHashProvider, mockUserRepo);
    jest.clearAllMocks();
  });

  it('should throw BadRequestException if email already exists', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    } as any);

    const dto: CreateUserDto = {
      name: 'Zuhair',
      email: 'test@test.com',
      password: '123456',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('should hash the password before saving', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockHashProvider.hash.mockResolvedValue('hashed_password');
    mockUserRepo.save.mockResolvedValue({
      id: '1',
      name: 'Zuhair',
      email: 'z@z.com',
      password: 'hashed_password',
    });

    const dto: CreateUserDto = {
      name: 'Zuhair',
      email: 'z@z.com',
      password: 'plain_password',
    };

    await useCase.execute(dto);

    expect(mockHashProvider.hash).toHaveBeenCalledWith('plain_password');
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed_password' }),
    );
  });

  it('should return the saved user', async () => {
    const savedUser = {
      id: '1',
      name: 'Zuhair',
      email: 'z@z.com',
      password: 'hashed',
    } as any;
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockHashProvider.hash.mockResolvedValue('hashed');
    mockUserRepo.save.mockResolvedValue(savedUser);

    const dto: CreateUserDto = {
      name: 'Zuhair',
      email: 'z@z.com',
      password: '123456',
    };

    const result = await useCase.execute(dto);

    expect(result).toEqual(savedUser);
  });
});
