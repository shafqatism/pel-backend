import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';
import { PaginationQueryDto } from '../../../common/dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('fleet - assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fleet/assignments')
export class AssignmentsController {
  constructor(private readonly svc: AssignmentsService) {}

  @Post() @ApiOperation({ summary: 'Assign a vehicle' })
  create(@Body() dto: CreateAssignmentDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get all assignments' })
  findAll(@Query() query: PaginationQueryDto) { return this.svc.findAll(query); }

  @Get(':id') @ApiOperation({ summary: 'Get assignment details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update/return assignment' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssignmentDto) { return this.svc.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete assignment' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
