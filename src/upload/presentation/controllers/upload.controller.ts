import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/guards/jwt-auth.guard';
import {
  ActiveUserData,
  CurrentUser,
} from '../../../shared/decorators/current-user.decorator';
import { UploadAvatarUseCase } from '../../application/use-cases/upload-avatar.use-case';
import { StoredFile } from '../../domain/interface/file-storage.interface';
import { plainToInstance } from 'class-transformer';
import { FileResponseDto } from '../dto/file-response.dto';
import { GetAllFilesUseCase } from '../../application/use-cases/get-all-files.use-case';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Role } from '../../../shared/enums/Role';
import { Roles } from '../../../shared/decorators/roles.decorator';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { Req } from '@nestjs/common';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly getAllFilesUseCase: GetAllFilesUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiOkResponse({ description: 'Avatar uploaded successfully' })
  @Post('avatar')
  async upload(
    @CurrentUser() user: ActiveUserData,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const storedFile: StoredFile = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };
    const savedFile = await this.uploadAvatarUseCase.execute(
      storedFile,
      user.id,
    );

    this.eventEmitter.emit('log.created', {
      action: 'UPLOAD_AVATAR',
      performedBy: user.id,
      details: `User uploaded a new avatar: ${file.originalname}`,
      ip: req.ip,
    });

    return plainToInstance(FileResponseDto, savedFile, {
      excludeExtraneousValues: true,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all files (Admin only)' })
  @ApiOkResponse({
    description: 'Returns all uploaded files',
    type: [FileResponseDto],
  })
  @Get('files')
  async getAllFiles() {
    const files = await this.getAllFilesUseCase.execute();
    return plainToInstance(FileResponseDto, files, {
      excludeExtraneousValues: true,
    });
  }
}
