import { Global, Module } from '@nestjs/common';
import { I_HASH_PROVIDER } from './interfaces/hash.provider';
import { BcryptProvider } from './providers/bcrypt.provider';

@Global()
@Module({
  providers: [
    {
      provide: I_HASH_PROVIDER,
      useClass: BcryptProvider,
    },
  ],
  exports: [I_HASH_PROVIDER],
})
export class SecurityModule {}
