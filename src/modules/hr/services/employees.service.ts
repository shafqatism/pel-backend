import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    if (dto.cnic) {
      const existing = await this.repo.findOne({ where: { cnic: dto.cnic } });
      if (existing) throw new ConflictException(`Employee with CNIC "${dto.cnic}" already exists`);
    }
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: EmployeeQueryDto): Promise<PaginatedResponseDto<Employee>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', department, status } = query;
    const qb = this.repo.createQueryBuilder('e');

    if (search) {
      qb.andWhere('(e.fullName ILIKE :s OR e.cnic ILIKE :s OR e.phone ILIKE :s OR e.designation ILIKE :s)', { s: `%${search}%` });
    }
    if (department) qb.andWhere('e.department = :department', { department });
    if (status) qb.andWhere('e.status = :status', { status });

    const allowed = ['createdAt', 'fullName', 'department', 'designation', 'basicSalary', 'joiningDate'];
    const col = allowed.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`e.${col}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Employee> {
    const e = await this.repo.findOne({ where: { id }, relations: ['attendanceRecords'] });
    if (!e) throw new NotFoundException(`Employee "${id}" not found`);
    return e;
  }

  async getStats() {
    const employees = await this.repo.find();
    const totalEmployees = employees.length;
    const byDepartment: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalSalary = 0;

    for (const e of employees) {
      byDepartment[e.department] = (byDepartment[e.department] || 0) + 1;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
      totalSalary += Number(e.basicSalary || 0);
    }

    return { totalEmployees, byDepartment, byStatus, totalSalary };
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const emp = await this.findOne(id);
    Object.assign(emp, dto);
    return this.repo.save(emp);
  }

  async remove(id: string) {
    const emp = await this.findOne(id);
    await this.repo.remove(emp);
    return { message: `Employee "${emp.fullName}" deleted` };
  }
}
