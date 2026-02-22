import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, SafetyAudit, HseDrill } from '../entities/hse.entity';
import { CreateIncidentDto, CreateAuditDto, CreateDrillDto, HseQueryDto } from '../dto';

@Injectable()
export class HseService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepo: Repository<Incident>,
    @InjectRepository(SafetyAudit)
    private readonly auditRepo: Repository<SafetyAudit>,
    @InjectRepository(HseDrill)
    private readonly drillRepo: Repository<HseDrill>,
  ) {}

  // Incidents
  async createIncident(dto: CreateIncidentDto) {
    const item = this.incidentRepo.create(dto);
    return this.incidentRepo.save(item);
  }

  async findAllIncidents(query: HseQueryDto) {
    const { limit = 10, offset = 0, site } = query;
    const qb = this.incidentRepo.createQueryBuilder('incident');
    if (site) qb.andWhere('incident.site = :site', { site });
    
    const [data, total] = await qb
      .take(limit)
      .skip(offset)
      .orderBy('incident.incidentDate', 'DESC')
      .getManyAndCount();

    return { data, total, limit, offset };
  }

  // Audits
  async createAudit(dto: CreateAuditDto) {
    const item = this.auditRepo.create(dto);
    return this.auditRepo.save(item);
  }

  async findAllAudits(query: HseQueryDto) {
    const { limit = 10, offset = 0, site } = query;
    const qb = this.auditRepo.createQueryBuilder('audit');
    if (site) qb.andWhere('audit.site = :site', { site });
    
    const [data, total] = await qb
      .take(limit)
      .skip(offset)
      .orderBy('audit.auditDate', 'DESC')
      .getManyAndCount();

    return { data, total, limit, offset };
  }

  // Drills
  async createDrill(dto: CreateDrillDto) {
    const item = this.drillRepo.create(dto);
    return this.drillRepo.save(item);
  }

  async findAllDrills(query: HseQueryDto) {
    const { limit = 10, offset = 0, site } = query;
    const qb = this.drillRepo.createQueryBuilder('drill');
    if (site) qb.andWhere('drill.site = :site', { site });
    
    const [data, total] = await qb
      .take(limit)
      .skip(offset)
      .orderBy('drill.drillDate', 'DESC')
      .getManyAndCount();

    return { data, total, limit, offset };
  }
}
