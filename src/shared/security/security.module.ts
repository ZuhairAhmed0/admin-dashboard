import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { I_HASH_PROVIDER } from './interfaces/hash.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { I_TOKEN_PROVIDER } from './interfaces/token.provider';
import { JwtProvider } from './providers/jwt.provider';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: I_HASH_PROVIDER,
      useClass: BcryptProvider,
    },
    {
      provide: I_TOKEN_PROVIDER,
      useClass: JwtProvider,
    },
  ],
  exports: [I_HASH_PROVIDER, I_TOKEN_PROVIDER],
})
export class SecurityModule {}
