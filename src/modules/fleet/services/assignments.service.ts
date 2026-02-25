import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto) {
    const data = {
      ...dto,
      assignmentDate: new Date(dto.assignmentDate),
      returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
    };
    return this.prisma.vehicleAssignment.create({ data });
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 20, search, sortOrder = 'desc' } = query;
    const where: Prisma.VehicleAssignmentWhereInput = {};

    if (search) {
      where.OR = [
        { assignedTo: { contains: search, mode: 'insensitive' } },
        { assignedBy: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicleAssignment.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: { vehicle: true },
        orderBy: { createdAt: sortOrder.toLowerCase() as any },
      }),
      this.prisma.vehicleAssignment.count({ where }),
    ]);

    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  async findOne(id: string) {
    const assignment = await this.prisma.vehicleAssignment.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!assignment) throw new NotFoundException(`Assignment "${id}" not found`);
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    try {
      const data: any = { ...dto };
      
      // Clean up empty strings to null for optional fields
      const optionalFields = ['purpose', 'assignedTo', 'assignedBy'];
      optionalFields.forEach(field => {
        if (data[field] === '') data[field] = null;
      });

      if (dto.assignmentDate) data.assignmentDate = new Date(dto.assignmentDate);
      if (dto.returnDate) data.returnDate = new Date(dto.returnDate);
      
      return await this.prisma.vehicleAssignment.update({
        where: { id },
        data,
      });
    } catch (e) {
      throw new NotFoundException(`Assignment "${id}" not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.vehicleAssignment.delete({ where: { id } });
      return { message: 'Assignment deleted' };
    } catch (e) {
      throw new NotFoundException(`Assignment "${id}" not found`);
    }
  }
}
