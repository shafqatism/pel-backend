import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto';

export class CreateSiteDto {
  @ApiProperty({ example: 'Site Alpha' })
  @IsString()
  siteName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: '24.8607, 67.0011' })
  @IsOptional()
  @IsString()
  coordinates?: string;

  @ApiPropertyOptional({ enum: ['exploration', 'drilling', 'production', 'decommissioned'], default: 'exploration' })
  @IsOptional()
  @IsIn(['exploration', 'drilling', 'production', 'decommissioned'])
  phase?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siteInCharge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSiteDto extends PartialType(CreateSiteDto) {}

export class SiteQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['exploration', 'drilling', 'production', 'decommissioned'] })
  @IsOptional()
  @IsString()
  phase?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  status?: string;
}
