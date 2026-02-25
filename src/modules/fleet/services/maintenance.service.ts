import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto, MaintenanceQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaintenanceDto) {
    const data = {
      ...dto,
      maintenanceDate: new Date(dto.maintenanceDate),
      nextServiceDueDate: dto.nextServiceDueDate ? new Date(dto.nextServiceDueDate) : null,
      costPkr: Number(dto.costPkr),
      odometerAtMaintenanceKm: dto.odometerAtMaintenanceKm ? Number(dto.odometerAtMaintenanceKm) : 0,
      nextServiceOdometerKm: dto.nextServiceOdometerKm ? Number(dto.nextServiceOdometerKm) : null,
    };
    return this.prisma.maintenanceRecord.create({ data });
  }

  async findAll(query: MaintenanceQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'maintenanceDate', sortOrder = 'desc', vehicleId, type } = query;
    const where: Prisma.MaintenanceRecordWhereInput = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { shopOrPerson: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (vehicleId) where.vehicleId = vehicleId;
    if (type) {
      const types = type.split(',').map((t) => t.trim());
      where.type = { in: types };
    }

    const allowed = ['maintenanceDate', 'costPkr', 'createdAt', 'type'];
    const col = allowed.includes(sortBy) ? sortBy : 'maintenanceDate';

    const [data, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: { vehicle: true },
        orderBy: { [col]: sortOrder.toLowerCase() },
      }),
      this.prisma.maintenanceRecord.count({ where }),
    ]);

    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  async findOne(id: string) {
    const m = await this.prisma.maintenanceRecord.findUnique({ where: { id }, include: { vehicle: true } });
    if (!m) throw new NotFoundException(`Maintenance record "${id}" not found`);
    return m;
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    
    // Clean up empty strings to null for optional fields
    const optionalFields = ['description', 'shopOrPerson'];
    optionalFields.forEach(field => {
      if (data[field] === '') data[field] = null;
    });

    if (dto.maintenanceDate) data.maintenanceDate = new Date(dto.maintenanceDate);
    if (dto.nextServiceDueDate) data.nextServiceDueDate = new Date(dto.nextServiceDueDate);
    if (dto.costPkr !== undefined) data.costPkr = Number(dto.costPkr);
    if (dto.odometerAtMaintenanceKm !== undefined) data.odometerAtMaintenanceKm = Number(dto.odometerAtMaintenanceKm);
    if (dto.nextServiceOdometerKm !== undefined) data.nextServiceOdometerKm = Number(dto.nextServiceOdometerKm);
    
    return this.prisma.maintenanceRecord.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.maintenanceRecord.delete({ where: { id } });
    return { message: 'Maintenance record deleted' };
  }
}
