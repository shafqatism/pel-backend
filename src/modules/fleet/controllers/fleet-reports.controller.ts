import { Controller, Get, Param, Res, Query, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FleetReportsService } from '../services/fleet-reports.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('fleet - reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fleet')
export class FleetReportsController {
  constructor(private readonly svc: FleetReportsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Executive dashboard fleet stats' })
  getStats() {
    return this.svc.getStats();
  }

  @Get('reports/utilization')
  @ApiOperation({ summary: 'Vehicle utilization report' })
  getUtilization() {
    return this.svc.getUtilization();
  }

  @Get('reports/fuel-consumption')
  @ApiOperation({ summary: 'Fuel consumption by vehicle' })
  getFuelConsumption() {
    return this.svc.getFuelConsumption();
  }

  @Get('reports/maintenance-costs')
  @ApiOperation({ summary: 'Maintenance cost breakdown' })
  getMaintenanceCosts() {
    return this.svc.getMaintenanceCosts();
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Fleet summary with aggregated metrics' })
  getFleetSummary() {
    console.log('[FleetReportsController] GET /fleet/reports/summary');
    return this.svc.getFleetSummary();
  }

  @Get('reports/vehicle/:id')
  @ApiOperation({ summary: 'Full report for a specific vehicle' })
  getVehicleReport(@Param('id') id: string) {
    return this.svc.getVehicleFullReport(id);
  }

  @Get('export/:type')
  @ApiOperation({ summary: 'Export fleet data. type = vehicles|trips|fuel|maintenance|assignments' })
  @ApiQuery({ name: 'format', enum: ['csv', 'excel', 'pdf'], required: false })
  async export(
    @Param('type') type: string,
    @Query('format') format: 'csv' | 'excel' | 'pdf' = 'csv',
    @Res() reply: FastifyReply,
  ) {
    return this.svc.exportData(type, format, reply);
  }
}
