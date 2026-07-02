import { Module } from '@nestjs/common';
import { UploadController } from './presentation/controllers/upload.controller';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import { FILE_REPOSITORY } from './domain/interface/file.repository';
import { PrismaFileRepository } from './infrastructure/repositories/prisma-file.repository';
import { FILE_STORAGE } from './domain/interface/file-storage.interface';
import { LocalStorageProvider } from './infrastructure/providers/local-storage.provider';

import { UsersModule } from '../users/users.module';
import { GetAllFilesUseCase } from './application/use-cases/get-all-files.use-case';

@Module({
  imports: [UsersModule],
  controllers: [UploadController],
  providers: [
    UploadAvatarUseCase,
    GetAllFilesUseCase,
    {
      provide: FILE_REPOSITORY,
      useClass: PrismaFileRepository,
    },
    {
      provide: FILE_STORAGE,
      useClass: LocalStorageProvider,
    },
  ],
})
export class UploadModule {}
