import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { IUSER_REPOSITORY } from '../../../users/domain/interfaces/user.repository';
import { I_TOKEN_PROVIDER } from '../../../shared/security/interfaces/token.provider';
import { I_HASH_PROVIDER } from '../../../shared/security/interfaces/hash.provider';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: { findById: jest.Mock; update: jest.Mock };
  let tokenProvider: {
    verifyRefreshToken: jest.Mock;
    generateToken: jest.Mock;
    refreshToken: jest.Mock;
  };
  let hashProvider: { compare: jest.Mock; hash: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn(), update: jest.fn() };
    tokenProvider = {
      verifyRefreshToken: jest.fn(),
      generateToken: jest.fn(),
      refreshToken: jest.fn(),
    };
    hashProvider = { compare: jest.fn(), hash: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: IUSER_REPOSITORY, useValue: userRepository },
        { provide: I_TOKEN_PROVIDER, useValue: tokenProvider },
        { provide: I_HASH_PROVIDER, useValue: hashProvider },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  it('should throw BadRequestException if token verify fails', async () => {
    tokenProvider.verifyRefreshToken.mockImplementation(() => {
      throw new Error();
    });
    await expect(useCase.execute('rt')).rejects.toThrow(BadRequestException);
  });

  it('should throw ForbiddenException if user not found or no refresh token saved', async () => {
    tokenProvider.verifyRefreshToken.mockReturnValue({ userId: '1' });
    userRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('rt')).rejects.toThrow(ForbiddenException);

    userRepository.findById.mockResolvedValue({ id: '1' }); // no refreshToken
    await expect(useCase.execute('rt')).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if tokens do not match', async () => {
    tokenProvider.verifyRefreshToken.mockReturnValue({ userId: '1' });
    userRepository.findById.mockResolvedValue({
      id: '1',
      refreshToken: 'hashedRt',
    });
    hashProvider.compare.mockResolvedValue(false);
    await expect(useCase.execute('rt')).rejects.toThrow(ForbiddenException);
  });

  it('should refresh tokens and return new ones', async () => {
    tokenProvider.verifyRefreshToken.mockReturnValue({ userId: '1' });
    const mockUser = {
      id: '1',
      role: 'admin',
      refreshToken: 'hashedRt',
      name: 'Test',
      email: 't@t.com',
      status: 'active',
      avatar: 'a.png',
      createdAt: new Date(),
    };
    userRepository.findById.mockResolvedValue(mockUser);
    hashProvider.compare.mockResolvedValue(true);

    tokenProvider.generateToken.mockReturnValue('new-at');
    tokenProvider.refreshToken.mockReturnValue('new-rt');
    hashProvider.hash.mockResolvedValue('hashedNewRt');

    const result = await useCase.execute('rt');

    expect(userRepository.update).toHaveBeenCalledWith('1', {
      refreshToken: 'hashedNewRt',
    });
    expect(result.accessToken).toBe('new-at');
    expect(result.refreshToken).toBe('new-rt');
    expect(result.user.id).toBe('1');
  });
});
