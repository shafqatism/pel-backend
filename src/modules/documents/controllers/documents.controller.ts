import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from '../services/documents.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto } from '../dto';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Register/Upload document' })
  create(@Body() dto: CreateDocumentDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all documents' })
  findAll(@Query() query: DocumentQueryDto) {
    return this.svc.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDocumentDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
