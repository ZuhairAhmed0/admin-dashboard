import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenProvider, PayloadToken } from '../interfaces/token.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtProvider implements ITokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateToken(payload: PayloadToken): string {
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn') as any,
    });
  }

  verifyToken(token: string): PayloadToken {
    return this.jwtService.verify(token, {
      secret: this.config.get<string>('jwt.secret'),
    });
  }

  refreshToken(payload: PayloadToken): string {
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn') as any,
    });
  }

  verifyRefreshToken(token: string): PayloadToken {
    return this.jwtService.verify(token, {
      secret: this.config.get<string>('jwt.refreshSecret'),
    });
  }
}
