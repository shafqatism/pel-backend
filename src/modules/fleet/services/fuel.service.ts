import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFuelLogDto, UpdateFuelLogDto, FuelQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FuelService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFuelLogDto) {
    // Convert numbers to Decimal for Prisma and ensure date is valid
    const data = {
      ...dto,
      date: dto.date ? new Date(dto.date) : new Date(),
      quantityLiters: Number(dto.quantityLiters),
      ratePerLiter: Number(dto.ratePerLiter),
      totalCost: Number(dto.totalCost),
      odometerReading: Number(dto.odometerReading),
    };
    const fuelLog = await this.prisma.fuelLog.create({ data });

    // Convert Decimal back to number for response
    return {
      ...fuelLog,
      quantityLiters: Number(fuelLog.quantityLiters),
      ratePerLiter: Number(fuelLog.ratePerLiter),
      totalCost: Number(fuelLog.totalCost),
      odometerReading: Number(fuelLog.odometerReading),
    };
  }

  async findAll(query: FuelQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      vehicleId,
    } = query;
    const where: Prisma.FuelLogWhereInput = {};

    if (search) where.stationName = { contains: search, mode: 'insensitive' };
    if (vehicleId) where.vehicleId = vehicleId;

    const [data, total] = await Promise.all([
      this.prisma.fuelLog.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: { vehicle: true },
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
      }),
      this.prisma.fuelLog.count({ where }),
    ]);

    // Convert Decimal fields to numbers for JSON serialization
    const convertedData = data.map((log) => ({
      ...log,
      quantityLiters: Number(log.quantityLiters),
      ratePerLiter: Number(log.ratePerLiter),
      totalCost: Number(log.totalCost),
      odometerReading: Number(log.odometerReading),
    }));

    return new PaginatedResponseDto(convertedData, total, page, limit);
  }

  async findOne(id: string) {
    const fuelLog = await this.prisma.fuelLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!fuelLog) throw new NotFoundException(`Fuel log "${id}" not found`);

    // Convert Decimal to number for JSON serialization
    return {
      ...fuelLog,
      quantityLiters: Number(fuelLog.quantityLiters),
      ratePerLiter: Number(fuelLog.ratePerLiter),
      totalCost: Number(fuelLog.totalCost),
      odometerReading: Number(fuelLog.odometerReading),
    };
  }

  async update(id: string, dto: UpdateFuelLogDto) {
    try {
      const data: any = { ...dto };
      
      // Clean up empty strings to null for optional fields
      const optionalFields = ['stationName', 'receiptUrl'];
      optionalFields.forEach(field => {
        if (data[field] === '') data[field] = null;
      });

      if (dto.date) data.date = new Date(dto.date);
      if (dto.quantityLiters !== undefined) data.quantityLiters = Number(dto.quantityLiters);
      if (dto.ratePerLiter !== undefined) data.ratePerLiter = Number(dto.ratePerLiter);
      if (dto.totalCost !== undefined) data.totalCost = Number(dto.totalCost);
      if (dto.odometerReading !== undefined) data.odometerReading = Number(dto.odometerReading);

      const fuelLog = await this.prisma.fuelLog.update({
        where: { id },
        data,
      });

      // Convert Decimal back to number for response
      return {
        ...fuelLog,
        quantityLiters: Number(fuelLog.quantityLiters),
        ratePerLiter: Number(fuelLog.ratePerLiter),
        totalCost: Number(fuelLog.totalCost),
        odometerReading: Number(fuelLog.odometerReading),
      };
    } catch (e) {
      throw new NotFoundException(`Fuel log "${id}" not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.fuelLog.delete({ where: { id } });
      return { message: 'Fuel log deleted' };
    } catch (e) {
      throw new NotFoundException(`Fuel log "${id}" not found`);
    }
  }

  async getStats() {
    const result = await this.prisma.fuelLog.aggregate({
      _sum: {
        quantityLiters: true,
        totalCost: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalLiters: Number(result._sum.quantityLiters || 0),
      totalCost: Number(result._sum.totalCost || 0),
      totalEntries: Number(result._count.id || 0),
    };
  }
}
