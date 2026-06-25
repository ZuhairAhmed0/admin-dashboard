import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(data: Partial<User>): Promise<User>;
  findAll(query?: Partial<User>): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
}

export const IUSER_REPOSITORY = 'IUSER_REPOSITORY';
