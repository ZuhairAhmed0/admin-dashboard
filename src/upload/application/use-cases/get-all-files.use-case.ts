import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_REPOSITORY,
  IFileRepository,
} from '../../domain/interface/file.repository';
import { FileEntity } from '../../domain/entities/file.entity';

@Injectable()
export class GetAllFilesUseCase {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepository: IFileRepository,
  ) {}

  async execute(): Promise<FileEntity[]> {
    return this.fileRepository.findAll();
  }
}
