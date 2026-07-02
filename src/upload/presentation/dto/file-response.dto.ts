import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'avatar.png' })
  @Expose()
  filename: string;

  @ApiProperty({ example: '/uploads/123e4567-e89b-12d3-a456-426614174000.png' })
  @Expose()
  url: string;

  @ApiProperty({ example: 'image/png' })
  @Expose()
  mimeType: string;

  @ApiProperty({ example: 10245 })
  @Expose()
  size: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  uploadedBy: string;

  @ApiProperty({ example: '2026-07-01T12:00:00Z', required: false })
  @Expose()
  createdAt?: Date;
}
