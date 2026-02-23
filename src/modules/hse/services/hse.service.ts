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
    const item = this.incidentRepo.create(dto as any);
    return this.incidentRepo.save(item);
  }

  async findAllIncidents(query: HseQueryDto) {
    const { limit = 20, page = 1, site } = query;
    const qb = this.incidentRepo.createQueryBuilder('incident');
    if (site) qb.andWhere('incident.site = :site', { site });
    
    const [data, total] = await qb
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('incident.incidentDate', 'DESC')
      .getManyAndCount();

    return { data, total, limit, page };
  }

  // Audits
  async createAudit(dto: CreateAuditDto) {
    const item = this.auditRepo.create(dto as any);
    return this.auditRepo.save(item);
  }

  async findAllAudits(query: HseQueryDto) {
    const { limit = 20, page = 1, site } = query;
    const qb = this.auditRepo.createQueryBuilder('audit');
    if (site) qb.andWhere('audit.site = :site', { site });
    
    const [data, total] = await qb
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('audit.auditDate', 'DESC')
      .getManyAndCount();

    return { data, total, limit, page };
  }

  // Drills
  async createDrill(dto: CreateDrillDto) {
    const item = this.drillRepo.create(dto as any);
    return this.drillRepo.save(item);
  }

  async findAllDrills(query: HseQueryDto) {
    const { limit = 20, page = 1, site } = query;
    const qb = this.drillRepo.createQueryBuilder('drill');
    if (site) qb.andWhere('drill.site = :site', { site });
    
    const [data, total] = await qb
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('drill.drillDate', 'DESC')
      .getManyAndCount();

    return { data, total, limit, page };
  }

  async getStats() {
    const incidents = await this.incidentRepo.find();
    const audits = await this.auditRepo.find();
    
    const severityCount = {
      low: incidents.filter(i => i.severity === 'low').length,
      medium: incidents.filter(i => i.severity === 'medium').length,
      high: incidents.filter(i => i.severity === 'high').length,
      critical: incidents.filter(i => i.severity === 'critical').length,
    };

    const statusCount = {
      open: incidents.filter(i => i.status === 'open').length,
      investigating: incidents.filter(i => i.status === 'investigating').length,
      closed: incidents.filter(i => i.status === 'closed').length,
    };

    const avgAuditScore = audits.length > 0 
      ? audits.reduce((s, a) => s + a.score, 0) / audits.length 
      : 100;

    return { severityCount, statusCount, avgAuditScore };
  }
}
