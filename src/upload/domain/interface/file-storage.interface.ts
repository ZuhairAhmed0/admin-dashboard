export interface StoredFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface IFileStorage {
  save(file: StoredFile): Promise<string>;
  delete(fileUrl: string): Promise<void>;
}

export const FILE_STORAGE = 'FILE_STORAGE';
