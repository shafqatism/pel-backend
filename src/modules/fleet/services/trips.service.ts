import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTripDto, UpdateTripDto, TripQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    const data = {
      ...dto,
      tripDate: new Date(dto.tripDate),
      timeOut: dto.timeOut ? new Date(dto.timeOut) : null,
      timeIn: dto.timeIn ? new Date(dto.timeIn) : null,
      meterOut: Number(dto.meterOut),
      meterIn: dto.meterIn ? Number(dto.meterIn) : null,
      fuelAllottedLiters: dto.fuelAllottedLiters ? Number(dto.fuelAllottedLiters) : 0,
      fuelCostPkr: dto.fuelCostPkr ? Number(dto.fuelCostPkr) : 0,
    };
    return this.prisma.trip.create({ data });
  }

  async findAll(query: TripQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', vehicleId, status } = query;
    const where: Prisma.TripWhereInput = {};

    if (search) {
      where.OR = [
        { destination: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } },
        { purposeOfVisit: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: { vehicle: true },
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  async findOne(id: string) {
    const t = await this.prisma.trip.findUnique({ where: { id }, include: { vehicle: true } });
    if (!t) throw new NotFoundException(`Trip "${id}" not found`);
    return t;
  }

  async update(id: string, dto: UpdateTripDto) {
    const trip = await this.findOne(id);
    const updateData: any = { ...dto };
    
    // Clean up empty strings to null for optional fields
    const optionalFields = ['purposeOfVisit', 'driverName', 'alternativeDriverName'];
    optionalFields.forEach(field => {
      if (updateData[field] === '') updateData[field] = null;
    });

    if (dto.tripDate) updateData.tripDate = new Date(dto.tripDate);
    if (dto.timeOut) updateData.timeOut = new Date(dto.timeOut);
    if (dto.timeIn) updateData.timeIn = new Date(dto.timeIn);
    
    if (dto.meterIn !== undefined) {
      updateData.meterIn = dto.meterIn === null ? null : Number(dto.meterIn);
      if (updateData.meterIn !== null && trip.meterOut) {
        updateData.totalKm = Number(updateData.meterIn) - Number(trip.meterOut);
      }
    }
    if (dto.meterOut !== undefined) updateData.meterOut = Number(dto.meterOut);
    if (dto.fuelAllottedLiters !== undefined) updateData.fuelAllottedLiters = Number(dto.fuelAllottedLiters);
    if (dto.fuelCostPkr !== undefined) updateData.fuelCostPkr = Number(dto.fuelCostPkr);

    return this.prisma.trip.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.trip.delete({ where: { id } });
    return { message: 'Trip deleted' };
  }
}
