import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto';

export class CreateFoodMessDto {
  @ApiProperty({ example: '2026-02-22' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner'], example: 'lunch' })
  @IsIn(['breakfast', 'lunch', 'dinner'])
  mealType: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  headCount: number;

  @ApiPropertyOptional({ example: 'Rice, Lentils, Chicken Curry' })
  @IsOptional()
  @IsString()
  menuItems?: string;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsNumber()
  costPerHead?: number;

  @ApiPropertyOptional({ example: 22500 })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  site?: string;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preparedBy?: string;
}

export class UpdateFoodMessDto extends PartialType(CreateFoodMessDto) {}

export class FoodMessQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['breakfast', 'lunch', 'dinner'] })
  @IsOptional()
  @IsString()
  mealType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  site?: string;
}
