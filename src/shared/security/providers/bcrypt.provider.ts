import { Injectable } from '@nestjs/common';
import { IHashProvider } from '../interfaces/hash.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements IHashProvider {
  private readonly saltFpunds = 10;

  async hash(plasnText: string): Promise<string> {
    return bcrypt.hash(plasnText, this.saltFpunds);
  }

  async compare(plasnText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plasnText, hashedText);
  }
}
