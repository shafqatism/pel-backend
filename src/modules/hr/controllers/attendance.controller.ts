import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto, AttendanceQueryDto } from '../dto';

@ApiTags('hr - attendance')
@Controller('hr/attendance')
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Post() @ApiOperation({ summary: 'Log attendance' })
  create(@Body() dto: CreateAttendanceDto) { return this.svc.create(dto); }

  @Get() @ApiOperation({ summary: 'Get attendance records' })
  findAll(@Query() query: AttendanceQueryDto) { return this.svc.findAll(query); }

  @Get('stats') @ApiOperation({ summary: 'Today\'s attendance stats' })
  getStats() { return this.svc.getStats(); }
}
