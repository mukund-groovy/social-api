// src/media/media.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureMediaService } from '@aauti/nest-azure-media';

@Controller('media')
export class MediaController {
  constructor(private readonly azureMediaService: AzureMediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const url = await this.azureMediaService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return { url };
  }

  @Delete('remove/:filename')
  async removeFile(@Param('filename') filename: string) {
    const deleted = await this.azureMediaService.removeFile(filename);
    return { deleted };
  }
}
