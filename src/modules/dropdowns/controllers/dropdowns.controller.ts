import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { DropdownsService } from '../services/dropdowns.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dropdowns')
@Controller('dropdowns')
export class DropdownsController {
  constructor(private readonly dropdownsService: DropdownsService) {}

  @Get()
  @ApiOperation({ summary: 'Get options for a category' })
  findAll(@Query('category') category: string) {
    return this.dropdownsService.findAll(category);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new option to a category' })
  create(@Query('category') category: string, @Body() data: { label: string; value: string }) {
    return this.dropdownsService.create(category, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an option' })
  remove(@Param('id') id: string) {
    return this.dropdownsService.delete(id);
  }
}
