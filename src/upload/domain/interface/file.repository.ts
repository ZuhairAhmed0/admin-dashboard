import { FileEntity } from '../entities/file.entity';

export interface IFileRepository {
  save(file: FileEntity): Promise<FileEntity>;
  findById(id: string): Promise<FileEntity | null>;
  findByUser(userId: string): Promise<FileEntity[]>;
  findAll(): Promise<FileEntity[]>;
  delete(id: string): Promise<void>;
}
export const FILE_REPOSITORY = 'FILE_REPOSITORY';
