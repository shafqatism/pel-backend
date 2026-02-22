import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FoodService } from '../services/food.service';
import { CreateFoodMessDto, UpdateFoodMessDto, FoodMessQueryDto } from '../dto';

@ApiTags('food-mess')
@Controller('food-mess')
export class FoodController {
  constructor(private readonly svc: FoodService) {}

  @Post()
  @ApiOperation({ summary: 'Log a meal entry' })
  create(@Body() dto: CreateFoodMessDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal logs' })
  findAll(@Query() query: FoodMessQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Meal statistics' })
  getStats() {
    return this.svc.getStats();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update meal log' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFoodMessDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meal log' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
