import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_REPOSITORY,
  IFileRepository,
} from '../../domain/interface/file.repository';
import { FileEntity } from '../../domain/entities/file.entity';
import {
  FILE_STORAGE,
  IFileStorage,
  StoredFile,
} from '../../domain/interface/file-storage.interface';

import { IUSER_REPOSITORY } from 'src/users/domain/interfaces/user.repository';
import { IUserRepository } from 'src/users/domain/interfaces/user.repository';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject(FILE_STORAGE) private readonly fileStorage: IFileStorage,
    @Inject(FILE_REPOSITORY) private readonly fileRepository: IFileRepository,
    @Inject(IUSER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(file: StoredFile, userId: string): Promise<FileEntity> {
    const user = await this.userRepository.findById(userId);

    const url = await this.fileStorage.save(file);
    const fileEntity = new FileEntity(
      undefined,
      file.originalname,
      url,
      file.mimetype,
      file.size,
      userId,
    );
    const savedFile = await this.fileRepository.save(fileEntity);

    await this.userRepository.update(userId, { avatar: url });

    if (user && user.avatar) {
      await this.fileStorage.delete(user.avatar);

      const userFiles = await this.fileRepository.findByUser(userId);
      const oldFileEntity = userFiles.find((f) => f.url === user.avatar);
      if (oldFileEntity) {
        await this.fileRepository.delete(oldFileEntity.id);
      }
    }

    return savedFile;
  }
}
