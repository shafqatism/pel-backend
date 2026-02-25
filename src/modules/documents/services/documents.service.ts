import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDocumentDto) {
    const data: Prisma.DocumentCreateInput = {
      ...dto,
      fileSize: dto.fileSize ? Number(dto.fileSize) : null,
    };
    return this.prisma.document.create({ data });
  }

  async findAll(query: DocumentQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', category, department, site } = query;
    const where: Prisma.DocumentWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (department) where.department = department;
    if (site) where.site = { contains: site, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder.toLowerCase() as any },
      }),
      this.prisma.document.count({ where }),
    ]);

    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  async findOne(id: string) {
    const d = await this.prisma.document.findUnique({ where: { id } });
    if (!d) throw new NotFoundException(`Document "${id}" not found`);
    return d;
  }

  async update(id: string, dto: UpdateDocumentDto) {
    await this.findOne(id);
    const data: Prisma.DocumentUpdateInput = { ...dto };
    if (dto.fileSize !== undefined) data.fileSize = dto.fileSize ? Number(dto.fileSize) : null;
    
    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.document.delete({ where: { id } });
    return { message: 'Document deleted' };
  }
}
