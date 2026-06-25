import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../domain/enums/Role';
import { Status } from '../../domain/enums/Status';

export class FilterUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
