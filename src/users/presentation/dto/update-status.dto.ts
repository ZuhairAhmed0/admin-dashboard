import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../domain/enums/Status';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;
}
