import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IFileStorage,
  StoredFile,
} from '../../domain/interface/file-storage.interface';

@Injectable()
export class LocalStorageProvider implements IFileStorage, OnModuleInit {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDirectory = path.join(process.cwd(), 'uploads');

  async onModuleInit() {
    try {
      await fs.mkdir(this.uploadDirectory, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create upload directory', error);
    }
  }

  async save(file: StoredFile): Promise<string> {
    const extension = path.extname(file.originalname);
    const uniqueFilename = `${randomUUID()}${extension}`;
    const filePath = path.join(this.uploadDirectory, uniqueFilename);

    await fs.writeFile(filePath, file.buffer);

    return `/uploads/${uniqueFilename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const filename = fileUrl.split('/').pop();
      if (!filename) return;

      const filePath = path.join(this.uploadDirectory, filename);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.error(`Failed to delete file at ${fileUrl}`, error);
    }
  }
}
