import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.settings.count();
    if (count === 0) {
      await this.prisma.settings.create({
        data: {
          companyName: 'Petroleum Exploration Limited',
          currency: 'PKR',
          unitSystem: 'metric',
          maintenanceIntervalKm: 5000,
          systemEmail: 'admin@pelexploration.com.pk',
          brandingColors: {
            primary: '#d97706',
            primaryForeground: '#ffffff',
            secondary: '#1f2937',
            secondaryForeground: '#ffffff',
            accent: '#fbbf24',
            accentForeground: '#000000',
            success: '#10b981',
            successForeground: '#ffffff',
            warning: '#f59e0b',
            warningForeground: '#ffffff',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
            background: '#ffffff',
            foreground: '#09090b',
            card: '#ffffff',
            cardForeground: '#09090b',
            popover: '#ffffff',
            popoverForeground: '#09090b',
            border: '#e4e4e7',
            input: '#e4e4e7',
            ring: '#d97706',
            sidebar: '#1f2937',
            sidebarForeground: '#a1a1aa',
            sidebarAccent: '#d97706',
            sidebarAccentForeground: '#ffffff',
          },
          enableNotifications: true,
        },
      });
    }
  }

  async getSettings() {
    const settings = await this.prisma.settings.findMany();
    const s = settings[0];
    if (!s) return null;

    // Merge with defaults to ensure all keys exist for the dynamic theme
    const defaults = {
      primary: '#d97706',
      primaryForeground: '#ffffff',
      secondary: '#1f2937',
      secondaryForeground: '#ffffff',
      accent: '#fbbf24',
      accentForeground: '#000000',
      success: '#10b981',
      successForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      background: '#ffffff',
      foreground: '#09090b',
      card: '#ffffff',
      cardForeground: '#09090b',
      popover: '#ffffff',
      popoverForeground: '#09090b',
      border: '#e4e4e7',
      input: '#e4e4e7',
      ring: '#d97706',
      sidebar: '#1f2937',
      sidebarForeground: '#a1a1aa',
      sidebarAccent: '#d97706',
      sidebarAccentForeground: '#ffffff',
    };

    return {
      ...s,
      brandingColors: {
        ...defaults,
        ...(s.brandingColors as object || {}),
      },
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const settings = await this.getSettings();
    if (!settings) {
      throw new Error('Settings not found');
    }
    return this.prisma.settings.update({
      where: { id: (settings as any).id }, // Cast to any to access the original Prisma model id
      data: dto as any,
    });
  }
}
