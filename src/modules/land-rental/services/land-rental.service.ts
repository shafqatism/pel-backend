import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLandRentalDto, UpdateLandRentalDto, LandRentalQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LandRentalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLandRentalDto) {
    const data: Prisma.LandRentalCreateInput = {
      ...dto,
      leaseStartDate: new Date(dto.leaseStartDate),
      leaseEndDate: dto.leaseEndDate ? new Date(dto.leaseEndDate) : null,
      areaAcres: dto.areaAcres ? Number(dto.areaAcres) : null,
      monthlyRent: Number(dto.monthlyRent),
    };
    const landRental = await this.prisma.landRental.create({ data });
    
    // Convert Decimal to number for response
    return {
      ...landRental,
      areaAcres: landRental.areaAcres ? Number(landRental.areaAcres) : null,
      monthlyRent: Number(landRental.monthlyRent),
    };
  }

  async findAll(query: LandRentalQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, site } = query;
    const where: Prisma.LandRentalWhereInput = {};

    if (search) {
      where.OR = [
        { landOwnerName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { landOwnerCnic: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (site) where.site = { contains: site, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.landRental.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder.toLowerCase() as any },
      }),
      this.prisma.landRental.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const convertedData = data.map(landRental => ({
      ...landRental,
      areaAcres: landRental.areaAcres ? Number(landRental.areaAcres) : null,
      monthlyRent: Number(landRental.monthlyRent),
    }));

    return new PaginatedResponseDto(convertedData as any, total, page, limit);
  }

  async findOne(id: string) {
    const l = await this.prisma.landRental.findUnique({ where: { id } });
    if (!l) throw new NotFoundException(`Land rental agreement "${id}" not found`);
    
    // Convert Decimal to number for response
    return {
      ...l,
      areaAcres: l.areaAcres ? Number(l.areaAcres) : null,
      monthlyRent: Number(l.monthlyRent),
    };
  }

  async getStats() {
    const [total, active, rent] = await Promise.all([
      this.prisma.landRental.count(),
      this.prisma.landRental.count({ where: { status: 'active' } }),
      this.prisma.landRental.aggregate({
        where: { status: 'active' },
        _sum: { monthlyRent: true }
      }),
    ]);

    return {
      totalAgreements: total,
      activeRentals: active,
      totalMonthlyRent: Number(rent._sum.monthlyRent || 0),
    };
  }

  async update(id: string, dto: UpdateLandRentalDto) {
    await this.findOne(id);
    const data: Prisma.LandRentalUpdateInput = { ...dto };
    
    if (dto.leaseEndDate) data.leaseEndDate = new Date(dto.leaseEndDate);
    if (dto.areaAcres !== undefined) data.areaAcres = dto.areaAcres ? Number(dto.areaAcres) : null;
    if (dto.monthlyRent !== undefined) data.monthlyRent = Number(dto.monthlyRent);
    
    const landRental = await this.prisma.landRental.update({
      where: { id },
      data,
    });
    
    // Convert Decimal to number for response
    return {
      ...landRental,
      areaAcres: landRental.areaAcres ? Number(landRental.areaAcres) : null,
      monthlyRent: Number(landRental.monthlyRent),
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.landRental.delete({ where: { id } });
    return { message: 'Land rental deleted' };
  }
}
