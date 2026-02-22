import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';
import { PaginationQueryDto } from '../../../common/dto';

@ApiTags('fleet - assignments')
@Controller('fleet/assignments')
export class AssignmentsController {
  constructor(private readonly svc: AssignmentsService) {}

  @Post() @ApiOperation({ summary: 'Assign a vehicle' })
  create(@Body() dto: CreateAssignmentDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get all assignments' })
  findAll(@Query() query: PaginationQueryDto) { return this.svc.findAll(query); }

  @Patch(':id') @ApiOperation({ summary: 'Update/return assignment' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssignmentDto) { return this.svc.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete assignment' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
