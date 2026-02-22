import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelLog } from '../entities';
import { CreateFuelLogDto, FuelQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(FuelLog)
    private readonly repo: Repository<FuelLog>,
  ) {}

  async create(dto: CreateFuelLogDto): Promise<FuelLog> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: FuelQueryDto): Promise<PaginatedResponseDto<FuelLog>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', vehicleId } = query;
    const qb = this.repo.createQueryBuilder('f').leftJoinAndSelect('f.vehicle', 'vehicle');

    if (search) qb.andWhere('(f.stationName ILIKE :s)', { s: `%${search}%` });
    if (vehicleId) qb.andWhere('f.vehicleId = :vehicleId', { vehicleId });

    qb.orderBy(`f.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getStats() {
    const result = await this.repo
      .createQueryBuilder('f')
      .select('SUM(f.quantityLiters)', 'totalLiters')
      .addSelect('SUM(f.totalCost)', 'totalCost')
      .addSelect('COUNT(f.id)', 'totalEntries')
      .getRawOne();

    return {
      totalLiters: Number(result?.totalLiters || 0),
      totalCost: Number(result?.totalCost || 0),
      totalEntries: Number(result?.totalEntries || 0),
    };
  }
}
