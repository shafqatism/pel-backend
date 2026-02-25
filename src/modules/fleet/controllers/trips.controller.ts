import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from '../services/trips.service';
import { CreateTripDto, UpdateTripDto, TripQueryDto } from '../dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('fleet - trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fleet/trips')
export class TripsController {
  constructor(private readonly svc: TripsService) {}

  @Post() @ApiOperation({ summary: 'Log a new trip' })
  create(@Body() dto: CreateTripDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get all trips (paginated)' })
  findAll(@Query() query: TripQueryDto) { return this.svc.findAll(query); }

  @Get(':id') @ApiOperation({ summary: 'Get trip details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update trip' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTripDto) { return this.svc.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete trip' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
