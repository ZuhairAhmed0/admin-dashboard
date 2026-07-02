import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../shared/enums/Role';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ enum: Role, example: Role.ADMIN })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
