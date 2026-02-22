import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleAssignment } from '../entities';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../../../common/dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(VehicleAssignment)
    private readonly repo: Repository<VehicleAssignment>,
  ) {}

  async create(dto: CreateAssignmentDto): Promise<VehicleAssignment> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<VehicleAssignment>> {
    const { page = 1, limit = 20, search, sortOrder = 'DESC' } = query;
    const qb = this.repo.createQueryBuilder('a').leftJoinAndSelect('a.vehicle', 'vehicle');

    if (search) {
      qb.andWhere('(a.assignedTo ILIKE :s OR a.assignedBy ILIKE :s OR a.purpose ILIKE :s)', { s: `%${search}%` });
    }

    qb.orderBy('a.createdAt', sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<VehicleAssignment> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Assignment "${id}" not found`);
    Object.assign(a, dto);
    return this.repo.save(a);
  }

  async remove(id: string) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Assignment "${id}" not found`);
    await this.repo.remove(a);
    return { message: 'Assignment deleted' };
  }
}
