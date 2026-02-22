import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HseService } from '../services/hse.service';
import { CreateIncidentDto, CreateAuditDto, CreateDrillDto, HseQueryDto } from '../dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('hse')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hse')
export class HseController {
  constructor(private readonly hseService: HseService) {}

  @Post('incidents')
  @ApiOperation({ summary: 'Log a new safety incident' })
  createIncident(@Body() dto: CreateIncidentDto) {
    return this.hseService.createIncident(dto);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'List safety incidents' })
  findAllIncidents(@Query() query: HseQueryDto) {
    return this.hseService.findAllIncidents(query);
  }

  @Post('audits')
  @ApiOperation({ summary: 'Log a safety audit' })
  createAudit(@Body() dto: CreateAuditDto) {
    return this.hseService.createAudit(dto);
  }

  @Get('audits')
  @ApiOperation({ summary: 'List safety audits' })
  findAllAudits(@Query() query: HseQueryDto) {
    return this.hseService.findAllAudits(query);
  }

  @Post('drills')
  @ApiOperation({ summary: 'Log an HSE drill' })
  createDrill(@Body() dto: CreateDrillDto) {
    return this.hseService.createDrill(dto);
  }

  @Get('drills')
  @ApiOperation({ summary: 'List HSE drills' })
  findAllDrills(@Query() query: HseQueryDto) {
    return this.hseService.findAllDrills(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get HSE analytics statistics' })
  getStats() {
    return this.hseService.getStats();
  }
}
