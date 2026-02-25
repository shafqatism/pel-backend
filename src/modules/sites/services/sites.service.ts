import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSiteDto, UpdateSiteDto, SiteQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSiteDto) {
    const data: Prisma.ProjectSiteCreateInput = {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
    };
    return this.prisma.projectSite.create({ data });
  }

  async findAll(query: SiteQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'siteName', sortOrder = 'asc', phase, status } = query;
    const where: Prisma.ProjectSiteWhereInput = {};

    if (search) {
      where.OR = [
        { siteName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (phase) where.phase = phase;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.projectSite.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder.toLowerCase() as any },
      }),
      this.prisma.projectSite.count({ where }),
    ]);

    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  async findOne(id: string) {
    const site = await this.prisma.projectSite.findUnique({ where: { id } });
    if (!site) throw new NotFoundException(`Project Site "${id}" not found`);
    return site;
  }

  async getStats() {
    const [totalSites, activeProduction, underExploration, ongoingDrilling] = await Promise.all([
      this.prisma.projectSite.count(),
      this.prisma.projectSite.count({ where: { phase: 'production', status: 'active' } }),
      this.prisma.projectSite.count({ where: { phase: 'exploration' } }),
      this.prisma.projectSite.count({ where: { phase: 'drilling' } }),
    ]);

    return {
      totalSites,
      activeProduction,
      underExploration,
      ongoingDrilling,
    };
  }

  async update(id: string, dto: UpdateSiteDto) {
    await this.findOne(id);
    const data: Prisma.ProjectSiteUpdateInput = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    
    return this.prisma.projectSite.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.projectSite.delete({ where: { id } });
    return { message: 'Project Site deleted' };
  }

  async getDropdownList() {
    return this.prisma.projectSite.findMany({
      select: { id: true, siteName: true },
      where: { status: 'active' },
      orderBy: { siteName: 'asc' },
    });
  }
}
