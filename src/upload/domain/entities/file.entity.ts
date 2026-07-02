export class FileEntity {
  constructor(
    public readonly id: string,
    public filename: string,
    public url: string,
    public mimeType: string,
    public size: number,
    public uploadedBy: string,
    public createdAt?: Date,
  ) {}
}
