import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAttendanceDto, AttendanceQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto) {
    const data = {
      ...dto,
      date: new Date(dto.date),
      checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
      checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
    };
    return this.prisma.attendance.create({ data });
  }

  async findAll(query: AttendanceQueryDto) {
    const { page = 1, limit = 20, search, sortOrder = 'desc', employeeId, date } = query;
    const where: Prisma.AttendanceWhereInput = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (date) {
      const d = new Date(date);
      where.date = d;
    }
    if (search) {
      where.employee = {
        fullName: { contains: search, mode: 'insensitive' },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: { employee: true },
        orderBy: [{ date: sortOrder.toLowerCase() as any }, { createdAt: sortOrder.toLowerCase() as any }],
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  async update(id: string, dto: Partial<CreateAttendanceDto>) {
    try {
      const data: Prisma.AttendanceUpdateInput = { ...dto };
      if (dto.checkIn) data.checkIn = new Date(dto.checkIn);
      if (dto.checkOut) data.checkOut = new Date(dto.checkOut);
      
      return await this.prisma.attendance.update({
        where: { id },
        data,
      });
    } catch (e) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.attendance.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: today,
      },
      _count: { _all: true },
    });

    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    stats.forEach(s => {
      if (s.status in counts) counts[s.status as keyof typeof counts] = s._count._all;
    });

    return { 
      ...counts, 
      onLeave: counts.leave, 
      date: today.toISOString().split('T')[0] 
    };
  }
}
