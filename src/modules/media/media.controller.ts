import { Controller, Post, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(@Req() req: FastifyRequest) {
    if (!(req as any).isMultipart()) {
      throw new BadRequestException('Expected multipart/form-data');
    }

    const data = await (req as any).file();
    if (!data) throw new BadRequestException('No file uploaded');

    const url = await this.svc.saveFile(data);
    return { url };
  }
}
