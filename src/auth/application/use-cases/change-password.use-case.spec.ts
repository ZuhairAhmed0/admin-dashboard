import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordUseCase } from './change-password.use-case';
import { IUSER_REPOSITORY } from '../../../users/domain/interfaces/user.repository';
import { I_HASH_PROVIDER } from '../../../shared/security/interfaces/hash.provider';
import { I_TOKEN_PROVIDER } from '../../../shared/security/interfaces/token.provider';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let usersRepository: { findById: jest.Mock; update: jest.Mock };
  let hashProvider: { compare: jest.Mock; hash: jest.Mock };
  let tokenProvider: { generateToken: jest.Mock; refreshToken: jest.Mock };

  beforeEach(async () => {
    usersRepository = { findById: jest.fn(), update: jest.fn() };
    hashProvider = { compare: jest.fn(), hash: jest.fn() };
    tokenProvider = { generateToken: jest.fn(), refreshToken: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        { provide: IUSER_REPOSITORY, useValue: usersRepository },
        { provide: I_HASH_PROVIDER, useValue: hashProvider },
        { provide: I_TOKEN_PROVIDER, useValue: tokenProvider },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  it('should throw BadRequestException if new password equals old password', async () => {
    await expect(useCase.execute('1', 'same', 'same')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException if user not found', async () => {
    usersRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1', 'old', 'new')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw UnauthorizedException if old password is wrong', async () => {
    usersRepository.findById.mockResolvedValue({
      id: '1',
      password: 'hashedOld',
    });
    hashProvider.compare.mockResolvedValue(false);
    await expect(useCase.execute('1', 'wrong', 'new')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should successfully change password and return tokens', async () => {
    usersRepository.findById.mockResolvedValue({
      id: '1',
      password: 'hashedOld',
      role: 'admin',
    });
    hashProvider.compare.mockResolvedValue(true);
    tokenProvider.generateToken.mockReturnValue('new-at');
    tokenProvider.refreshToken.mockReturnValue('new-rt');
    hashProvider.hash
      .mockResolvedValueOnce('hashedNewPassword')
      .mockResolvedValueOnce('hashedNewRt');

    const result = await useCase.execute('1', 'old', 'new');

    expect(usersRepository.update).toHaveBeenCalledWith('1', {
      password: 'hashedNewPassword',
      refreshToken: 'hashedNewRt',
    });
    expect(result).toEqual({ accessToken: 'new-at', refreshToken: 'new-rt' });
  });
});
