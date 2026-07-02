import { Role } from '../../enums/Role';

export interface PayloadToken {
  userId: string;
  role: Role;
}
export interface ITokenProvider {
  generateToken(payload: PayloadToken): string;
  refreshToken(payload: PayloadToken): string;
  verifyToken(token: string): PayloadToken;
  verifyRefreshToken(token: string): PayloadToken;
}
export const I_TOKEN_PROVIDER = 'ITokenProvider';
