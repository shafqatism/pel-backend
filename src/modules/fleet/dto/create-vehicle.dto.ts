import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'LEA-1234' })
  @IsString()
  registrationNumber: string;

  @ApiProperty({ example: 'Toyota Hilux - Site Alpha' })
  @IsString()
  vehicleName: string;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Hilux' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ example: 'White' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  engineNumber?: string;

  @ApiPropertyOptional({
    enum: ['sedan', 'suv', 'pickup', 'truck', 'bus', 'van', 'motorcycle', 'heavy_equipment'],
    default: 'sedan',
  })
  @IsOptional()
  @IsIn(['sedan', 'suv', 'pickup', 'truck', 'bus', 'van', 'motorcycle', 'heavy_equipment'])
  type?: string;

  @ApiPropertyOptional({
    enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid'],
    default: 'petrol',
  })
  @IsOptional()
  @IsIn(['petrol', 'diesel', 'cng', 'electric', 'hybrid'])
  fuelType?: string;

  @ApiPropertyOptional({
    enum: ['company_owned', 'leased', 'rented', 'contractor'],
    default: 'company_owned',
  })
  @IsOptional()
  @IsIn(['company_owned', 'leased', 'rented', 'contractor'])
  ownershipStatus?: string;

  @ApiPropertyOptional({ enum: ['active', 'in_maintenance', 'inactive', 'decommissioned'] })
  @IsOptional()
  @IsIn(['active', 'in_maintenance', 'inactive', 'decommissioned'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedSite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedDepartment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentDriverName?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  currentOdometerKm?: number;

  @ApiPropertyOptional({ default: 5000 })
  @IsOptional()
  @IsNumber()
  maintenanceIntervalKm?: number;

  @ApiPropertyOptional({ default: 180 })
  @IsOptional()
  @IsNumber()
  maintenanceIntervalDays?: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  registrationExpiry?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  fitnessExpiry?: string;
}
