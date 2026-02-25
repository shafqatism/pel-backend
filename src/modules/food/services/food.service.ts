import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFoodMessDto, UpdateFoodMessDto, FoodMessQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FoodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFoodMessDto) {
    const data: Prisma.FoodMessCreateInput = {
      ...dto,
      date: new Date(dto.date),
      costPerHead: Number(dto.costPerHead),
      totalCost: dto.totalCost ? Number(dto.totalCost) : (Number(dto.headCount) * Number(dto.costPerHead)),
      rating: dto.rating ? Number(dto.rating) : null,
    };
    const foodMess = await this.prisma.foodMess.create({ data });
    
    // Convert Decimal to number for response
    return {
      ...foodMess,
      costPerHead: Number(foodMess.costPerHead),
      totalCost: Number(foodMess.totalCost),
      rating: foodMess.rating ? Number(foodMess.rating) : null,
    };
  }

  async findAll(query: FoodMessQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'date', sortOrder = 'desc', mealType, date, site } = query;
    const where: Prisma.FoodMessWhereInput = {};

    if (search) {
      where.OR = [
        { menuItems: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (mealType) where.mealType = mealType;
    if (date) where.date = new Date(date);
    if (site) where.site = { contains: site, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.foodMess.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder.toLowerCase() as any },
      }),
      this.prisma.foodMess.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const convertedData = data.map(foodMess => ({
      ...foodMess,
      costPerHead: Number(foodMess.costPerHead),
      totalCost: Number(foodMess.totalCost),
      rating: foodMess.rating ? Number(foodMess.rating) : null,
    }));

    return new PaginatedResponseDto(convertedData as any, total, page, limit);
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCount, todayCostSum, ratings, totalCostSum] = await Promise.all([
      this.prisma.foodMess.aggregate({
        where: { date: today },
        _sum: { headCount: true, totalCost: true },
      }),
      this.prisma.foodMess.aggregate({
        where: { date: today },
        _sum: { totalCost: true },
      }),
      this.prisma.foodMess.aggregate({
        where: { NOT: { rating: null } },
        _avg: { rating: true },
      }),
      this.prisma.foodMess.aggregate({
        _sum: { totalCost: true },
      }),
    ]);

    return {
      mealsToday: todayCount._sum.headCount || 0,
      avgRating: Math.round((Number(ratings._avg.rating) || 0) * 10) / 10,
      todayCost: Number(todayCount._sum.totalCost || 0),
      monthlyCost: Number(totalCostSum._sum.totalCost || 0),
    };
  }

  async findOne(id: string) {
    const f = await this.prisma.foodMess.findUnique({ where: { id } });
    if (!f) throw new NotFoundException(`Meal entry "${id}" not found`);
    
    // Convert Decimal to number for response
    return {
      ...f,
      costPerHead: Number(f.costPerHead),
      totalCost: Number(f.totalCost),
      rating: f.rating ? Number(f.rating) : null,
    };
  }

  async update(id: string, dto: UpdateFoodMessDto) {
    const f = await this.findOne(id);
    const data: Prisma.FoodMessUpdateInput = { ...dto };
    
    if (dto.costPerHead !== undefined) data.costPerHead = Number(dto.costPerHead);
    if (dto.totalCost !== undefined) data.totalCost = Number(dto.totalCost);
    if (dto.rating !== undefined) data.rating = dto.rating ? Number(dto.rating) : null;
    
    // Recalculate totalCost if headCount or costPerHead changed
    if (dto.headCount !== undefined || dto.costPerHead !== undefined) {
      const headCount = dto.headCount ?? f.headCount;
      const costPerHead = dto.costPerHead ?? Number(f.costPerHead);
      data.totalCost = headCount * costPerHead;
    }

    const foodMess = await this.prisma.foodMess.update({
      where: { id },
      data,
    });
    
    // Convert Decimal to number for response
    return {
      ...foodMess,
      costPerHead: Number(foodMess.costPerHead),
      totalCost: Number(foodMess.totalCost),
      rating: foodMess.rating ? Number(foodMess.rating) : null,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.foodMess.delete({ where: { id } });
    return { message: 'Meal entry deleted' };
  }
}
