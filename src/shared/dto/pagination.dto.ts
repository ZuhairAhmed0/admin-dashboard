import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 1,
    description: 'Number of items per page',
  })
  @IsOptional()
  @IsPositive()
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    default: 1,
    description: 'Page number',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;
}
