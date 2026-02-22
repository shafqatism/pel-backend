import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandRental } from '../entities/land-rental.entity';
import { CreateLandRentalDto, UpdateLandRentalDto, LandRentalQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class LandRentalService {
  constructor(
    @InjectRepository(LandRental)
    private readonly repo: Repository<LandRental>,
  ) {}

  async create(dto: CreateLandRentalDto): Promise<LandRental> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: LandRentalQueryDto): Promise<PaginatedResponseDto<LandRental>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', status, site } = query;
    const qb = this.repo.createQueryBuilder('l');

    if (search) {
      qb.andWhere('(l.landOwnerName ILIKE :s OR l.location ILIKE :s OR l.landOwnerCnic ILIKE :s)', { s: `%${search}%` });
    }
    if (status) qb.andWhere('l.status = :status', { status });
    if (site) qb.andWhere('l.site ILIKE :site', { site: `%${site}%` });

    qb.orderBy(`l.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<LandRental> {
    const l = await this.repo.findOne({ where: { id } });
    if (!l) throw new NotFoundException(`Land rental agreement "${id}" not found`);
    return l;
  }

  async getStats() {
    const rentals = await this.repo.find();
    return {
      totalAgreements: rentals.length,
      activeRentals: rentals.filter(r => r.status === 'active').length,
      totalMonthlyRent: rentals.filter(r => r.status === 'active').reduce((sum, r) => sum + Number(r.monthlyRent), 0),
    };
  }

  async update(id: string, dto: UpdateLandRentalDto): Promise<LandRental> {
    const l = await this.findOne(id);
    Object.assign(l, dto);
    return this.repo.save(l);
  }

  async remove(id: string) {
    const l = await this.findOne(id);
    await this.repo.remove(l);
    return { message: 'Land rental deleted' };
  }
}
