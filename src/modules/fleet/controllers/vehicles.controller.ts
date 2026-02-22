import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VehiclesService } from '../services/vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from '../dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('fleet - vehicles')
@UseGuards(JwtAuthGuard)
@Controller('fleet/vehicles')
export class VehiclesController {
  constructor(private readonly svc: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle registered' })
  create(@Body() dto: CreateVehicleDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles (paginated, filterable)' })
  findAll(@Query() query: VehicleQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Fleet summary statistics' })
  getSummary() {
    return this.svc.getSummary();
  }

  @Get('dropdown')
  @ApiOperation({ summary: 'Active vehicles for dropdowns' })
  getDropdownList() {
    return this.svc.getDropdownList();
  }

  @Get('compliance')
  @ApiOperation({ summary: 'Vehicles with expiring documents' })
  getComplianceAlerts() {
    return this.svc.getComplianceAlerts();
  }

  @Get('maintenance-predictions')
  @ApiOperation({ summary: 'AI-predicted maintenance dates' })
  getMaintenancePredictions() {
    return this.svc.getMaintenancePredictions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single vehicle with relations' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVehicleDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vehicle' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
