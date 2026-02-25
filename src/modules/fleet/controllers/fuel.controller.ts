import { Controller, Get, Post, Patch, Delete, Body, Query, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FuelService } from '../services/fuel.service';
import { CreateFuelLogDto, UpdateFuelLogDto, FuelQueryDto } from '../dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('fleet - fuel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fleet/fuel')
export class FuelController {
  constructor(private readonly svc: FuelService) {}

  @Post() @ApiOperation({ summary: 'Log fuel entry' })
  create(@Body() dto: CreateFuelLogDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get fuel logs (paginated)' })
  findAll(@Query() query: FuelQueryDto) { return this.svc.findAll(query); }

  @Get('stats') @ApiOperation({ summary: 'Fuel consumption statistics' })
  getStats() { return this.svc.getStats(); }

  @Get(':id') @ApiOperation({ summary: 'Get fuel log details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update fuel log' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFuelLogDto) { return this.svc.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete fuel log' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
