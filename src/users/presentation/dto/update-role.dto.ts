import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../domain/enums/Role';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
