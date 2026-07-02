import { Injectable } from '@nestjs/common';
import { IHashProvider } from '../interfaces/hash.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements IHashProvider {
  private readonly saltRounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}
