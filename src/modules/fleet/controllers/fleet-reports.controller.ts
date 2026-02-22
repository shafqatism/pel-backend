import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FleetReportsService } from '../services/fleet-reports.service';

@ApiTags('fleet - reports')
@Controller('fleet')
export class FleetReportsController {
  constructor(private readonly svc: FleetReportsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Executive dashboard fleet stats' })
  getStats() { return this.svc.getStats(); }

  @Get('reports/utilization')
  @ApiOperation({ summary: 'Vehicle utilization report' })
  getUtilization() { return this.svc.getUtilization(); }

  @Get('reports/fuel-consumption')
  @ApiOperation({ summary: 'Fuel consumption by vehicle' })
  getFuelConsumption() { return this.svc.getFuelConsumption(); }

  @Get('reports/maintenance-costs')
  @ApiOperation({ summary: 'Maintenance cost breakdown' })
  getMaintenanceCosts() { return this.svc.getMaintenanceCosts(); }
}
