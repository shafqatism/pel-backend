import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FuelService } from '../services/fuel.service';
import { CreateFuelLogDto, FuelQueryDto } from '../dto';

@ApiTags('fleet - fuel')
@Controller('fleet/fuel')
export class FuelController {
  constructor(private readonly svc: FuelService) {}

  @Post() @ApiOperation({ summary: 'Log fuel entry' })
  create(@Body() dto: CreateFuelLogDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get fuel logs (paginated)' })
  findAll(@Query() query: FuelQueryDto) { return this.svc.findAll(query); }

  @Get('stats') @ApiOperation({ summary: 'Fuel consumption statistics' })
  getStats() { return this.svc.getStats(); }
}
