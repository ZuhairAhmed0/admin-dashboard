import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role } from '../../shared/enums/Role';
import { Status } from '../../users/domain/enums/Status';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;
  @ApiProperty({ example: 'John Doe' })
  @Expose()
  name: string;
  @ApiProperty({ example: 'john.doe@example.com' })
  @Expose()
  email: string;
  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  @Expose()
  status: Status;
  @ApiProperty({ enum: Role, example: Role.USER })
  @Expose()
  role: Role;
  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  @Expose()
  avatar?: string;
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;
}
