import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../domain/enums/Status';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ enum: Status, example: Status.SUSPEND })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;
}
