import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(private config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.get<string>('db.url'),
    });

    super({ adapter });
  }
}
