import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LandRentalService } from '../services/land-rental.service';
import { CreateLandRentalDto, UpdateLandRentalDto, LandRentalQueryDto } from '../dto';

@ApiTags('land-rentals')
@Controller('land-rentals')
export class LandRentalController {
  constructor(private readonly svc: LandRentalService) {}

  @Post()
  @ApiOperation({ summary: 'Create rental agreement' })
  create(@Body() dto: CreateLandRentalDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rentals (paginated)' })
  findAll(@Query() query: LandRentalQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Rental statistics' })
  getStats() {
    return this.svc.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rental details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rental agreement' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLandRentalDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete rental' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
