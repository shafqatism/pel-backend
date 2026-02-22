import { IsString, IsOptional, IsNumber, IsBoolean, IsEmail, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BrandingColorsDto {
  @IsString()
  primary: string;

  @IsString()
  secondary: string;

  @IsString()
  accent: string;
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
}
