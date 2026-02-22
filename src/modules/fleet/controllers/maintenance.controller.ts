import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MaintenanceService } from '../services/maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto, MaintenanceQueryDto } from '../dto';

@ApiTags('fleet - maintenance')
@Controller('fleet/maintenance')
export class MaintenanceController {
  constructor(private readonly svc: MaintenanceService) {}

  @Post() @ApiOperation({ summary: 'Create maintenance record' })
  create(@Body() dto: CreateMaintenanceDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get maintenance records (paginated)' })
  findAll(@Query() query: MaintenanceQueryDto) { return this.svc.findAll(query); }

  @Get(':id') @ApiOperation({ summary: 'Get maintenance record' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update maintenance record' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMaintenanceDto) { return this.svc.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete maintenance record' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
