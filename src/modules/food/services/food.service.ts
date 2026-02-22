import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodMess } from '../entities/food-mess.entity';
import { CreateFoodMessDto, UpdateFoodMessDto, FoodMessQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(FoodMess)
    private readonly repo: Repository<FoodMess>,
  ) {}

  async create(dto: CreateFoodMessDto): Promise<FoodMess> {
    const entry = this.repo.create(dto);
    if (!entry.totalCost && entry.headCount && entry.costPerHead) {
      entry.totalCost = entry.headCount * entry.costPerHead;
    }
    return this.repo.save(entry);
  }

  async findAll(query: FoodMessQueryDto): Promise<PaginatedResponseDto<FoodMess>> {
    const { page = 1, limit = 20, search, sortBy = 'date', sortOrder = 'DESC', mealType, date, site } = query;
    const qb = this.repo.createQueryBuilder('f');

    if (search) {
      qb.andWhere('(f.menuItems ILIKE :s OR f.remarks ILIKE :s)', { s: `%${search}%` });
    }
    if (mealType) qb.andWhere('f.mealType = :mealType', { mealType });
    if (date) qb.andWhere('f.date = :date', { date });
    if (site) qb.andWhere('f.site ILIKE :site', { site: `%${site}%` });

    qb.orderBy(`f.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const mealsToday = await this.repo.find({ where: { date: today as any } });
    
    const all = await this.repo.find();
    const totalCost = all.reduce((sum, f) => sum + Number(f.totalCost), 0);
    const avgRating = all.filter(f => f.rating).reduce((sum, f, _, arr) => sum + Number(f.rating) / arr.length, 0);

    return {
      mealsToday: mealsToday.reduce((sum, f) => sum + f.headCount, 0),
      avgRating: Math.round(avgRating * 10) / 10,
      todayCost: mealsToday.reduce((sum, f) => sum + Number(f.totalCost), 0),
      monthlyCost: totalCost, // Simplification
    };
  }

  async findOne(id: string): Promise<FoodMess> {
    const f = await this.repo.findOne({ where: { id } });
    if (!f) throw new NotFoundException(`Meal entry "${id}" not found`);
    return f;
  }

  async update(id: string, dto: UpdateFoodMessDto): Promise<FoodMess> {
    const f = await this.findOne(id);
    Object.assign(f, dto);
    if (!dto.totalCost && f.headCount && f.costPerHead) {
      f.totalCost = f.headCount * f.costPerHead;
    }
    return this.repo.save(f);
  }

  async remove(id: string) {
    const f = await this.findOne(id);
    await this.repo.remove(f);
    return { message: 'Meal entry deleted' };
  }
}
