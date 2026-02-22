import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../entities';
import { CreateTripDto, UpdateTripDto, TripQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly repo: Repository<Trip>,
  ) {}

  async create(dto: CreateTripDto): Promise<Trip> {
    const trip = this.repo.create(dto);
    return this.repo.save(trip);
  }

  async findAll(query: TripQueryDto): Promise<PaginatedResponseDto<Trip>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', vehicleId, status } = query;
    const qb = this.repo.createQueryBuilder('t').leftJoinAndSelect('t.vehicle', 'vehicle');

    if (search) {
      qb.andWhere('(t.destination ILIKE :s OR t.driverName ILIKE :s OR t.purposeOfVisit ILIKE :s)', { s: `%${search}%` });
    }
    if (vehicleId) qb.andWhere('t.vehicleId = :vehicleId', { vehicleId });
    if (status) qb.andWhere('t.status = :status', { status });

    qb.orderBy(`t.${sortBy === 'createdAt' ? 'createdAt' : sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Trip> {
    const t = await this.repo.findOne({ where: { id }, relations: ['vehicle'] });
    if (!t) throw new NotFoundException(`Trip "${id}" not found`);
    return t;
  }

  async update(id: string, dto: UpdateTripDto): Promise<Trip> {
    const trip = await this.findOne(id);
    if (dto.meterIn && trip.meterOut) {
      (trip as any).totalKm = Number(dto.meterIn) - Number(trip.meterOut);
    }
    Object.assign(trip, dto);
    return this.repo.save(trip);
  }

  async remove(id: string) {
    const t = await this.findOne(id);
    await this.repo.remove(t);
    return { message: 'Trip deleted' };
  }
}
