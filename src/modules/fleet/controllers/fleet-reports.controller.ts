import { Controller, Get, Param, Res, Query } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FleetReportsService } from '../services/fleet-reports.service';

@ApiTags('fleet - reports')
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
