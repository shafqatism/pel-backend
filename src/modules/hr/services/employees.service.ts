import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    if (dto.cnic) {
      const existing = await this.prisma.employee.findUnique({ where: { cnic: dto.cnic } });
      if (existing) throw new ConflictException(`Employee with CNIC "${dto.cnic}" already exists`);
    }
    const data: Prisma.EmployeeCreateInput = {
      ...dto,
      joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : null,
      basicSalary: Number(dto.basicSalary),
    };
    const emp = await this.prisma.employee.create({ data });
    
    // Convert Decimal to number for response
    return {
      ...emp,
      basicSalary: Number(emp.basicSalary),
    };
  }

  async findAll(query: EmployeeQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', department, status } = query;
    
    const where: Prisma.EmployeeWhereInput = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cnic: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (department) where.department = department;
    if (status) where.status = status;

    const allowed = ['createdAt', 'fullName', 'department', 'designation', 'basicSalary', 'joiningDate'];
    const col = allowed.includes(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [col]: sortOrder.toLowerCase() },
      }),
      this.prisma.employee.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const convertedData = data.map(emp => ({
      ...emp,
      basicSalary: Number(emp.basicSalary),
    }));

    return new PaginatedResponseDto(convertedData as any, total, page, limit);
  }

  async findOne(id: string) {
    const e = await this.prisma.employee.findUnique({ 
      where: { id }, 
      include: { attendanceRecords: true } 
    });
    if (!e) throw new NotFoundException(`Employee "${id}" not found`);
    
    // Convert Decimal to number for response
    return {
      ...e,
      basicSalary: Number(e.basicSalary),
    };
  }

  async getStats() {
    const [totalEmployees, depts, statuses, salary] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.groupBy({ by: ['department'], _count: { _all: true } }),
      this.prisma.employee.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.employee.aggregate({ _sum: { basicSalary: true } }),
    ]);

    const byDepartment: Record<string, number> = {};
    depts.forEach(d => byDepartment[d.department] = d._count._all);

    const byStatus: Record<string, number> = {};
    statuses.forEach(s => byStatus[s.status] = s._count._all);

    return { 
      totalEmployees, 
      byDepartment, 
      byStatus, 
      totalSalary: Number(salary._sum.basicSalary || 0) 
    };
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    const data: Prisma.EmployeeUpdateInput = { ...dto };
    if (dto.joiningDate) data.joiningDate = new Date(dto.joiningDate);
    if (dto.basicSalary !== undefined) data.basicSalary = Number(dto.basicSalary);
    
    const emp = await this.prisma.employee.update({
      where: { id },
      data,
    });
    
    // Convert Decimal to number for response
    return {
      ...emp,
      basicSalary: Number(emp.basicSalary),
    };
  }

  async remove(id: string) {
    const emp = await this.findOne(id);
    await this.prisma.employee.delete({ where: { id } });
    return { message: `Employee "${emp.fullName}" deleted` };
  }

  async getDropdownList() {
    return this.prisma.employee.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        fullName: true,
        designation: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }
}
