import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectSite } from '../entities/site.entity';
import { CreateSiteDto, UpdateSiteDto, SiteQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(ProjectSite)
    private readonly repo: Repository<ProjectSite>,
  ) {}

  async create(dto: CreateSiteDto): Promise<ProjectSite> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: SiteQueryDto): Promise<PaginatedResponseDto<ProjectSite>> {
    const { page = 1, limit = 20, search, sortBy = 'siteName', sortOrder = 'ASC', phase, status } = query;
    const qb = this.repo.createQueryBuilder('s');

    if (search) {
      qb.andWhere('(s.siteName ILIKE :s OR s.location ILIKE :s OR s.district ILIKE :s)', { s: `%${search}%` });
    }
    if (phase) qb.andWhere('s.phase = :phase', { phase });
    if (status) qb.andWhere('s.status = :status', { status });

    qb.orderBy(`s.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<ProjectSite> {
    const site = await this.repo.findOne({ where: { id } });
    if (!site) throw new NotFoundException(`Project Site "${id}" not found`);
    return site;
  }

  async getStats() {
    const sites = await this.repo.find();
    return {
      totalSites: sites.length,
      activeProduction: sites.filter(s => s.phase === 'production' && s.status === 'active').length,
      underExploration: sites.filter(s => s.phase === 'exploration').length,
      ongoingDrilling: sites.filter(s => s.phase === 'drilling').length,
    };
  }

  async update(id: string, dto: UpdateSiteDto): Promise<ProjectSite> {
    const site = await this.findOne(id);
    Object.assign(site, dto);
    return this.repo.save(site);
  }

  async remove(id: string) {
    const site = await this.findOne(id);
    await this.repo.remove(site);
    return { message: 'Project Site deleted' };
  }
}
