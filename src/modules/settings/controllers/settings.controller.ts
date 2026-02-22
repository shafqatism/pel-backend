import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global system settings' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update global system settings' })
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
