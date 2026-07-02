import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { Request, Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;
  let getCurrentUserUseCase: jest.Mocked<GetCurrentUserUseCase>;
  let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;

  beforeEach(async () => {
    const mockLoginUseCase = { execute: jest.fn() };
    const mockRefreshTokenUseCase = { execute: jest.fn() };
    const mockLogoutUseCase = { execute: jest.fn() };
    const mockGetCurrentUserUseCase = { execute: jest.fn() };
    const mockChangePasswordUseCase = { execute: jest.fn() };
    const mockConfigService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: RefreshTokenUseCase, useValue: mockRefreshTokenUseCase },
        { provide: LogoutUseCase, useValue: mockLogoutUseCase },
        { provide: GetCurrentUserUseCase, useValue: mockGetCurrentUserUseCase },
        { provide: ChangePasswordUseCase, useValue: mockChangePasswordUseCase },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    logoutUseCase = module.get(LogoutUseCase);
    getCurrentUserUseCase = module.get(GetCurrentUserUseCase);
    changePasswordUseCase = module.get(ChangePasswordUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user and set refresh token cookie', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const userRes = { id: '1', role: 'admin' };
      const mockResult = { refreshToken: 'rt', accessToken: 'at', ...userRes };
      loginUseCase.execute.mockResolvedValue(mockResult as any);

      const req = {} as Request;
      const res = { cookie: jest.fn() } as unknown as Response;

      const result = await controller.login(req, loginDto, res);

      expect(loginUseCase.execute).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'rt',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'at', ...userRes });
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if no refresh token', async () => {
      const req = { cookies: {} } as Request;
      const res = {} as Response;
      await expect(controller.refreshToken(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should refresh token and set new cookie', async () => {
      const req = { cookies: { refreshToken: 'old-rt' } } as unknown as Request;
      const res = { cookie: jest.fn() } as unknown as Response;
      const mockResult = {
        refreshToken: 'new-rt',
        accessToken: 'new-at',
        user: {},
      };
      refreshTokenUseCase.execute.mockResolvedValue(mockResult as any);

      const result = await controller.refreshToken(req, res);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith('old-rt');
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-rt',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'new-at', user: {} });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const req = { user: { id: '1', role: 'admin' } } as unknown as Request;
      getCurrentUserUseCase.execute.mockResolvedValue({ id: '1' } as any);

      const result = await controller.getCurrentUser(req);
      expect(getCurrentUserUseCase.execute).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('changePassword', () => {
    it('should change password and set new refresh token cookie', async () => {
      const req = { user: { id: '1', role: 'admin' } } as unknown as Request;
      const res = { cookie: jest.fn() } as unknown as Response;
      const dto = { oldPassword: 'old', newPassword: 'new' };
      changePasswordUseCase.execute.mockResolvedValue({
        refreshToken: 'new-rt',
        accessToken: 'new-at',
      });

      const result = await controller.changePassword(req, res, dto);

      expect(changePasswordUseCase.execute).toHaveBeenCalledWith(
        '1',
        'old',
        'new',
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-rt',
        expect.any(Object),
      );
      expect(result).toEqual({
        message: 'Password changed successfully',
        accessToken: 'new-at',
      });
    });
  });

  describe('logout', () => {
    it('should clear cookie and call logout usecase', async () => {
      const req = { cookies: { refreshToken: 'rt' } } as unknown as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;

      const result = await controller.logout(req, res);

      expect(logoutUseCase.execute).toHaveBeenCalledWith('rt');
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should just clear cookie if no refresh token', async () => {
      const req = { cookies: {} } as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;

      const result = await controller.logout(req, res);

      expect(logoutUseCase.execute).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
