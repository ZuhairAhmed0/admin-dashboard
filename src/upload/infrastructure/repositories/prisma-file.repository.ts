import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { IFileRepository } from '../../domain/interface/file.repository';
import { FileEntity } from '../../domain/entities/file.entity';

@Injectable()
export class PrismaFileRepository implements IFileRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async save(data: FileEntity): Promise<FileEntity> {
    const saveFile = await this.prisma.file.create({
      data: {
        filename: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        user: {
          connect: { id: data.uploadedBy },
        },
      },
    });

    return saveFile;
  }

  async findById(id: string): Promise<FileEntity | null> {
    const findFile = await this.prisma.file.findUnique({
      where: { id },
    });

    return findFile;
  }

  async findByUser(userId: string): Promise<FileEntity[]> {
    const findFileByUser = await this.prisma.file.findMany({
      where: { uploadedBy: userId },
    });

    return findFileByUser;
  }

  async findAll(): Promise<FileEntity[]> {
    const files = await this.prisma.file.findMany();

    return files;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.file.delete({
      where: { id },
    });
  }
}
