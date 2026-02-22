import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities';
import { CreateAttendanceDto, AttendanceQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,
  ) {}

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: AttendanceQueryDto): Promise<PaginatedResponseDto<Attendance>> {
    const { page = 1, limit = 20, search, sortOrder = 'DESC', employeeId, date } = query;
    const qb = this.repo.createQueryBuilder('a').leftJoinAndSelect('a.employee', 'employee');

    if (employeeId) qb.andWhere('a.employeeId = :employeeId', { employeeId });
    if (date) qb.andWhere('a.date = :date', { date });
    if (search) qb.andWhere('(employee.fullName ILIKE :s)', { s: `%${search}%` });

    qb.orderBy('a.date', sortOrder).addOrderBy('a.createdAt', sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const qb = this.repo.createQueryBuilder('a').where('a.date = :today', { today });

    const all = await qb.getMany();
    const present = all.filter((a) => a.status === 'present').length;
    const absent = all.filter((a) => a.status === 'absent').length;
    const late = all.filter((a) => a.status === 'late').length;
    const onLeave = all.filter((a) => a.status === 'leave').length;

    return { present, absent, late, onLeave, date: today };
  }
}
