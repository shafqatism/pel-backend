import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, UpdateExpenseStatusDto } from '../dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('finance - expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance/expenses')
export class ExpensesController {
  constructor(private readonly svc: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create expense record' })
  create(@Body() dto: CreateExpenseDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  findAll(@Query() query: ExpenseQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Financial stats for dashboard' })
  getStats() {
    return this.svc.getStats();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Expenditure trends for dashboard' })
  getTrends() {
    return this.svc.getTrends();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExpenseDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve or reject expense' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExpenseStatusDto) {
    return this.svc.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
