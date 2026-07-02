import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../../../shared/dto/user-response.dto';
import {
  ActiveUserData,
  CurrentUser,
} from 'src/shared/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import { EventEmitter2 } from '@nestjs/event-emitter';

@ApiTags('Authentication')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({
  description: 'Forbidden - You do not have permission to perform this action',
})
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('app.env') === 'production',
      sameSite: 'strict' as const,
      maxAge:
        this.configService.get<number>('app.cookieMaxAge') ||
        7 * 24 * 60 * 60 * 1000,
    };
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { refreshToken, accessToken, user } = await this.loginUseCase.execute(
      body.email,
      body.password,
    );

    res.cookie('refreshToken', refreshToken, this.getCookieOptions());
    this.eventEmitter.emit('log.created', {
      action: 'LOGIN',
      performedBy: user.id,
      details: `User with email: ${body.email} logged in`,
      ip: req.ip,
    });
    return { accessToken, ...user };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ description: 'Token refreshed successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const { refreshToken: newRefreshToken, ...userRes } =
      await this.refreshTokenUseCase.execute(refreshToken);

    res.cookie('refreshToken', newRefreshToken, this.getCookieOptions());

    return userRes;
  }

  @ApiOperation({ summary: 'Get current logged in user' })
  @ApiOkResponse({
    description: 'Current user fetched successfully',
    type: UserResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: ActiveUserData) {
    return this.getCurrentUserUseCase.execute(user.id);
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({ description: 'Password changed successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: ActiveUserData,
    @Res({ passthrough: true }) res: Response,
    @Body() body: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const tokens = await this.changePasswordUseCase.execute(
      user.id,
      body.oldPassword,
      body.newPassword,
    );
    res.cookie('refreshToken', tokens.refreshToken, this.getCookieOptions());

    this.eventEmitter.emit('log.created', {
      action: 'CHANGE_PASSWORD',
      performedBy: user.id,
      details: `User changed their password`,
      ip: req.ip,
    });
    return {
      message: 'Password changed successfully',
      accessToken: tokens.accessToken,
    };
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse({ description: 'User logged out successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @CurrentUser() user: ActiveUserData,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    }

    res.clearCookie('refreshToken', this.getCookieOptions());

    this.eventEmitter.emit('log.created', {
      action: 'LOGOUT',
      performedBy: user.id,
      details: `User logged out`,
      ip: req.ip,
    });
    return { message: 'Logged out successfully' };
  }
}
