import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LogResponseDto {
  @ApiProperty({
    example: 'clq123abc0000',
    description: 'The unique identifier of the log',
  })
  @Expose()
  id: string;

  @ApiProperty({ example: 'CREATE_USER', description: 'The action performed' })
  @Expose()
  action: string;

  @ApiProperty({
    example: 'user_id_123',
    description: 'ID of the user who performed the action',
  })
  @Expose()
  performedBy: string;

  @ApiPropertyOptional({
    example: 'User john@example.com was created successfully',
    description: 'Additional details about the action',
  })
  @Expose()
  details?: string;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'IP address from where the action was performed',
  })
  @Expose()
  ip?: string;

  @ApiProperty({
    example: '2023-12-01T12:00:00.000Z',
    description: 'The date and time when the log was created',
  })
  @Expose()
  createdAt: Date;
}
