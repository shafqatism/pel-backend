import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../entities/settings.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepo: Repository<Settings>,
  ) {}

  async onModuleInit() {
    // Ensure at least one settings record exists
    const count = await this.settingsRepo.count();
    if (count === 0) {
      const defaultSettings = this.settingsRepo.create({
        companyName: 'Petroleum Exploration Limited',
        currency: 'PKR',
        unitSystem: 'metric',
        maintenanceIntervalKm: 5000,
        systemEmail: 'admin@pelexploration.com.pk',
        brandingColors: {
          primary: '#d97706', // amber-600
          secondary: '#1f2937', // gray-800
          accent: '#fbbf24', // amber-400
        },
        enableNotifications: true,
      });
      await this.settingsRepo.save(defaultSettings);
    }
  }

  async getSettings() {
    const settings = await this.settingsRepo.find();
    return settings[0];
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const settings = await this.getSettings();
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }
}
