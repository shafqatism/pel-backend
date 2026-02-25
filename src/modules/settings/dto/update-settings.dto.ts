import { IsString, IsOptional, IsNumber, IsBoolean, IsEmail, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BrandingColorsDto {
  @IsString()
  primary: string;
  @IsString()
  primaryForeground: string;

  @IsString()
  secondary: string;
  @IsString()
  secondaryForeground: string;

  @IsString()
  accent: string;
  @IsString()
  accentForeground: string;

  @IsString()
  success: string;
  @IsString()
  successForeground: string;

  @IsString()
  warning: string;
  @IsString()
  warningForeground: string;

  @IsString()
  destructive: string;
  @IsString()
  destructiveForeground: string;

  @IsString()
  background: string;
  @IsString()
  foreground: string;

  @IsString()
  card: string;
  @IsString()
  cardForeground: string;

  @IsString()
  popover: string;
  @IsString()
  popoverForeground: string;

  @IsString()
  border: string;
  @IsString()
  input: string;
  @IsString()
  ring: string;

  @IsString()
  sidebar: string;
  @IsString()
  sidebarForeground: string;
  @IsString()
  sidebarAccent: string;
  @IsString()
  sidebarAccentForeground: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unitSystem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maintenanceIntervalKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  systemEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingColorsDto)
  brandingColors?: BrandingColorsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  r2AccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  r2AccessKeyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  r2SecretAccessKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  r2BucketName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  r2PublicCustomDomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customPresets?: any[];
}
