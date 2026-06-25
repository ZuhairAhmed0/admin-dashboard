import { Role } from '../enums/Role';
import { Status } from '../enums/Status';

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
    public refreshToken?: string,
    public avatar?: string,
    public role?: Role,
    public status?: Status,
    public tokenVersion?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
