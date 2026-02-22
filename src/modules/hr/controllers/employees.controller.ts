import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmployeesService } from '../services/employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('hr - employees')
@UseGuards(JwtAuthGuard)
@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  @Post() @ApiOperation({ summary: 'Create employee' })
  create(@Body() dto: CreateEmployeeDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get all employees (paginated)' })
  findAll(@Query() query: EmployeeQueryDto) { return this.svc.findAll(query); }

  @Get('stats') @ApiOperation({ summary: 'Employee statistics' })
  getStats() { return this.svc.getStats(); }

  @Get(':id') @ApiOperation({ summary: 'Get employee details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update employee' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto) { return this.svc.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete employee' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
