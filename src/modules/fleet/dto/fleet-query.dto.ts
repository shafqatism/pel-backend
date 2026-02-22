import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto';

export class VehicleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['sedan', 'suv', 'pickup', 'truck', 'bus', 'van', 'motorcycle', 'heavy_equipment'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid'] })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({ enum: ['company_owned', 'leased', 'rented', 'contractor'] })
  @IsOptional()
  @IsString()
  ownershipStatus?: string;

  @ApiPropertyOptional({ enum: ['active', 'in_maintenance', 'inactive', 'decommissioned'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedSite?: string;
}

export class TripQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ enum: ['in_progress', 'completed', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class MaintenanceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Comma-separated maintenance types' })
  @IsOptional()
  @IsString()
  type?: string;
}

export class FuelQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;
}
