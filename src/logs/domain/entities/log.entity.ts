export class LogEntity {
  public readonly id: string;
  public action: string;
  public performedBy: string;
  public details?: string;
  public ip?: string;
  public createdAt: Date;
}
