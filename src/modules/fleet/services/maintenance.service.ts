import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecord } from '../entities';
import { CreateMaintenanceDto, UpdateMaintenanceDto, MaintenanceQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRecord)
    private readonly repo: Repository<MaintenanceRecord>,
  ) {}

  async create(dto: CreateMaintenanceDto): Promise<MaintenanceRecord> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: MaintenanceQueryDto): Promise<PaginatedResponseDto<MaintenanceRecord>> {
    const { page = 1, limit = 10, search, sortBy = 'maintenanceDate', sortOrder = 'DESC', vehicleId, type } = query;
    const qb = this.repo.createQueryBuilder('m').leftJoinAndSelect('m.vehicle', 'vehicle');

    if (search) {
      qb.andWhere('(m.description ILIKE :s OR m.shopOrPerson ILIKE :s)', { s: `%${search}%` });
    }
    if (vehicleId) qb.andWhere('m.vehicleId = :vehicleId', { vehicleId });
    if (type) {
      const types = type.split(',').map((t) => t.trim());
      qb.andWhere('m.type IN (:...types)', { types });
    }

    const allowed = ['maintenanceDate', 'costPkr', 'createdAt', 'type'];
    const col = allowed.includes(sortBy) ? sortBy : 'maintenanceDate';
    qb.orderBy(`m.${col}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<MaintenanceRecord> {
    const m = await this.repo.findOne({ where: { id }, relations: ['vehicle'] });
    if (!m) throw new NotFoundException(`Maintenance record "${id}" not found`);
    return m;
  }

  async update(id: string, dto: UpdateMaintenanceDto): Promise<MaintenanceRecord> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async remove(id: string) {
    const m = await this.findOne(id);
    await this.repo.remove(m);
    return { message: 'Maintenance record deleted' };
  }
}
