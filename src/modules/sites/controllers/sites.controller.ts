import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SitesService } from '../services/sites.service';
import { CreateSiteDto, UpdateSiteDto, SiteQueryDto } from '../dto';

@ApiTags('project-sites')
@Controller('project-sites')
export class SitesController {
  constructor(private readonly svc: SitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project site' })
  create(@Body() dto: CreateSiteDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sites (paginated)' })
  findAll(@Query() query: SiteQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Site statistics for dashboard' })
  getStats() {
    return this.svc.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get site details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update site' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSiteDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete site' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
