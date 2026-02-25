import { Controller, Get, Post, Body, Query, Patch, Param, Delete } from '@nestjs/common';
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

  @Patch(':id') @ApiOperation({ summary: 'Update attendance record' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAttendanceDto>) {
    return this.svc.update(id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: 'Delete attendance record' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Get('stats') @ApiOperation({ summary: 'Today\'s attendance stats' })
  getStats() { return this.svc.getStats(); }
}
