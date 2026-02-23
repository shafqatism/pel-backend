import { IsString, IsOptional, IsDateString, IsIn, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto';

export class CreateIncidentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  incidentDate: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty()
  @IsString()
  reportedBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  site?: string;
}

export class CreateAuditDto {
  @ApiProperty()
  @IsString()
  auditTitle: string;

  @ApiProperty()
  @IsDateString()
  auditDate: string;

  @ApiProperty()
  @IsString()
  auditorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  site?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ enum: ['compliant', 'non_compliant', 'improvement_needed'] })
  @IsIn(['compliant', 'non_compliant', 'improvement_needed'])
  findings: 'compliant' | 'non_compliant' | 'improvement_needed';
}

export class CreateDrillDto {
  @ApiProperty()
  @IsString()
  drillType: string;

  @ApiProperty()
  @IsDateString()
  drillDate: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNumber()
  participantsCount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supervisor?: string;
}

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {}
export class UpdateAuditDto extends PartialType(CreateAuditDto) {}
export class UpdateDrillDto extends PartialType(CreateDrillDto) {}

export class HseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  site?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;
}
