import { Controller, Get, Post, Body, Query, UseGuards, Patch, Param, Delete } from '@nestjs/common';
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

  @Patch('incidents/:id')
  @ApiOperation({ summary: 'Update a safety incident' })
  updateIncident(@Param('id') id: string, @Body() dto: Partial<CreateIncidentDto>) {
    return this.hseService.updateIncident(id, dto);
  }

  @Delete('incidents/:id')
  @ApiOperation({ summary: 'Delete a safety incident' })
  removeIncident(@Param('id') id: string) {
    return this.hseService.removeIncident(id);
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

  @Patch('audits/:id')
  @ApiOperation({ summary: 'Update a safety audit' })
  updateAudit(@Param('id') id: string, @Body() dto: Partial<CreateAuditDto>) {
    return this.hseService.updateAudit(id, dto);
  }

  @Delete('audits/:id')
  @ApiOperation({ summary: 'Delete a safety audit' })
  removeAudit(@Param('id') id: string) {
    return this.hseService.removeAudit(id);
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

  @Patch('drills/:id')
  @ApiOperation({ summary: 'Update an HSE drill' })
  updateDrill(@Param('id') id: string, @Body() dto: Partial<CreateDrillDto>) {
    return this.hseService.updateDrill(id, dto);
  }

  @Delete('drills/:id')
  @ApiOperation({ summary: 'Delete an HSE drill' })
  removeDrill(@Param('id') id: string) {
    return this.hseService.removeDrill(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get HSE analytics statistics' })
  getStats() {
    return this.hseService.getStats();
  }
}
