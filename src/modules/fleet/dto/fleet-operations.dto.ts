import { IsString, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty() @IsString() vehicleId: string;
  @ApiProperty() @IsString() destination: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purposeOfVisit?: string;
  @ApiProperty() @IsDateString() tripDate: string;
  @ApiProperty() @IsNumber() meterOut: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() meterIn?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() timeOut?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() timeIn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() driverName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alternativeDriverName?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() personTravelList?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() fuelAllottedLiters?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() fuelCostPkr?: number;
}

export class UpdateTripDto {
  @ApiPropertyOptional() @IsOptional() @IsString() vehicleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destination?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purposeOfVisit?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() tripDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() meterOut?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() meterIn?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() timeOut?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() timeIn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() driverName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alternativeDriverName?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() personTravelList?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() fuelAllottedLiters?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() fuelCostPkr?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class CreateFuelLogDto {
  @ApiProperty() @IsString() vehicleId: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty() @IsNumber() quantityLiters: number;
  @ApiProperty() @IsNumber() ratePerLiter: number;
  @ApiProperty() @IsNumber() totalCost: number;
  @ApiProperty() @IsNumber() odometerReading: number;
  @ApiPropertyOptional() @IsOptional() @IsString() stationName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() receiptUrl?: string;
}

export class UpdateFuelLogDto {
  @ApiPropertyOptional() @IsOptional() @IsString() vehicleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantityLiters?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() ratePerLiter?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() odometerReading?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() stationName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() receiptUrl?: string;
}

export class CreateMaintenanceDto {
  @ApiProperty() @IsString() vehicleId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsDateString() maintenanceDate: string;
  @ApiProperty() @IsNumber() costPkr: number;
  @ApiPropertyOptional() @IsOptional() @IsString() shopOrPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() odometerAtMaintenanceKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() nextServiceOdometerKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextServiceDueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() maintenanceBy?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() documentUrls?: string[];
}

export class UpdateMaintenanceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() vehicleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() maintenanceDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() costPkr?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() shopOrPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() odometerAtMaintenanceKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() nextServiceOdometerKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextServiceDueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() maintenanceBy?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() documentUrls?: string[];
}

export class CreateAssignmentDto {
  @ApiProperty() @IsString() vehicleId: string;
  @ApiProperty() @IsString() assignedTo: string;
  @ApiProperty() @IsString() assignedBy: string;
  @ApiProperty() @IsDateString() assignmentDate: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() returnDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purpose?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class UpdateAssignmentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() vehicleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() assignmentDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() returnDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purpose?: string;
}
