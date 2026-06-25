import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IUserRepository } from '../../domain/interfaces/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Role as PrismaRole, Status as PrismaStatus } from '@prisma/client';
import { Role } from '../../domain/enums/Role';
import { Status } from '../../domain/enums/Status';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: DatabaseService) {}

  private toDomain(record: {
    id: string;
    name: string;
    email: string;
    password: string;
    refreshToken: string;
    avatar: string;
    role: PrismaRole;
    status: PrismaStatus;
    tokenVersion: number;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      record.id,
      record.name,
      record.email,
      record.password,
      record.refreshToken,
      record.avatar,
      record.role as Role,
      record.status as Status,
      record.tokenVersion,
      record.createdAt,
      record.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;

    return this.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findAll(query?: Partial<User>): Promise<User[]> {
    const users = await this.prisma.user.findMany({ where: query ?? {} });

    return users.map((user) => this.toDomain(user));
  }

  async save(data: Partial<User>): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        refreshToken: data.refreshToken,
        avatar: data.avatar,
        role: data.role,
        status: data.status,
        tokenVersion: data.tokenVersion,
      },
    });
    return this.toDomain(newUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.toDomain(updatedUser);
  }
}
