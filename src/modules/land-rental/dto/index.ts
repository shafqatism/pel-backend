import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto';

export class CreateLandRentalDto {
  @ApiProperty({ example: 'Jan Muhammad' })
  @IsString()
  landOwnerName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landOwnerCnic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landOwnerPhone?: string;

  @ApiProperty({ example: 'Kirthar Block' })
  @IsString()
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 10.5 })
  @IsOptional()
  @IsNumber()
  areaAcres?: number;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  monthlyRent: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  leaseStartDate: string;

  @ApiPropertyOptional({ example: '2028-12-31' })
  @IsOptional()
  @IsDateString()
  leaseEndDate?: string;

  @ApiPropertyOptional({ enum: ['active', 'expired', 'terminated'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'expired', 'terminated'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agreementDocUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  site?: string;
}

export class UpdateLandRentalDto extends PartialType(CreateLandRentalDto) {}

export class LandRentalQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['active', 'expired', 'terminated'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  site?: string;
}
