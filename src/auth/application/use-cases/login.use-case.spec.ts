import { ForbiddenException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../../../users/domain/interfaces/user.repository';
import { IHashProvider } from '../../../shared/security/interfaces/hash.provider';
import { ITokenProvider } from '../../../shared/security/interfaces/token.provider';
import { Status } from '../../../users/domain/enums/Status';
import { Role } from '../../../shared/enums/Role';

const mockUserRepository: jest.Mocked<IUserRepository> = {
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

const mockTokenProvider: jest.Mocked<ITokenProvider> = {
  generateToken: jest.fn(),
  refreshToken: jest.fn(),
  verifyToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    useCase = new LoginUseCase(
      mockTokenProvider,
      mockHashProvider,
      mockUserRepository,
    );
    jest.clearAllMocks();
  });

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    role: Role.ADMIN,
    status: Status.ACTIVE,
    avatar: 'avatar.png',
    createdAt: new Date(),
  };

  it('should throw ForbiddenException if user is not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('test@example.com', 'password'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute('test@example.com', 'password'),
    ).rejects.toThrow('Invalid credentials');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockHashProvider.compare).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if password does not match', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockHashProvider.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('test@example.com', 'wrong-password'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute('test@example.com', 'wrong-password'),
    ).rejects.toThrow('Invalid credentials');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockHashProvider.compare).toHaveBeenCalledWith(
      'wrong-password',
      'hashed-password',
    );
    expect(mockTokenProvider.generateToken).not.toHaveBeenCalled();
  });

  it('should return accessToken, refreshToken and user info on successful login', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockHashProvider.compare.mockResolvedValue(true);

    mockTokenProvider.generateToken.mockReturnValue('mocked-access-token');
    mockTokenProvider.refreshToken.mockReturnValue('mocked-refresh-token');

    const result = await useCase.execute(
      'test@example.com',
      'correct-password',
    );

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockHashProvider.compare).toHaveBeenCalledWith(
      'correct-password',
      'hashed-password',
    );

    expect(mockTokenProvider.generateToken).toHaveBeenCalledWith({
      userId: mockUser.id,
      role: mockUser.role,
    });

    expect(mockTokenProvider.refreshToken).toHaveBeenCalledWith({
      userId: mockUser.id,
      role: mockUser.role,
    });

    expect(result).toEqual({
      accessToken: 'mocked-access-token',
      refreshToken: 'mocked-refresh-token',
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        status: mockUser.status,
        avatar: mockUser.avatar,
        createdAt: mockUser.createdAt,
      },
    });
  });
});
