import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from './logout.use-case';
import { IUSER_REPOSITORY } from '../../../users/domain/interfaces/user.repository';
import { I_TOKEN_PROVIDER } from '../../../shared/security/interfaces/token.provider';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let userRepository: { update: jest.Mock };
  let tokenProvider: { verifyRefreshToken: jest.Mock };

  beforeEach(async () => {
    userRepository = { update: jest.fn() };
    tokenProvider = { verifyRefreshToken: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: IUSER_REPOSITORY, useValue: userRepository },
        { provide: I_TOKEN_PROVIDER, useValue: tokenProvider },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  it('should invalidate session and remove refresh token', async () => {
    tokenProvider.verifyRefreshToken.mockReturnValue({ userId: '1' });
    await useCase.execute('rt');
    expect(userRepository.update).toHaveBeenCalledWith('1', {
      refreshToken: null,
    });
  });

  it('should not throw if token verification fails', async () => {
    tokenProvider.verifyRefreshToken.mockImplementation(() => {
      throw new Error();
    });
    await expect(useCase.execute('rt')).resolves.not.toThrow();
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
