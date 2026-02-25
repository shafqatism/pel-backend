import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateIncidentDto, CreateAuditDto, CreateDrillDto, HseQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HseService {
  constructor(private readonly prisma: PrismaService) {}

  // Incidents
  async createIncident(dto: CreateIncidentDto) {
    const data: Prisma.IncidentCreateInput = {
      ...dto,
      incidentDate: new Date(dto.incidentDate),
    };
    return this.prisma.incident.create({ data });
  }

  async findAllIncidents(query: HseQueryDto) {
    const { limit = 20, page = 1, site } = query;
    const where: Prisma.IncidentWhereInput = site 
      ? { site: { contains: site, mode: 'insensitive' } } 
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { incidentDate: 'desc' },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return { data, total, limit, page };
  }

  async updateIncident(id: string, dto: Partial<CreateIncidentDto>) {
    try {
      const data: Prisma.IncidentUpdateInput = { ...dto };
      if (dto.incidentDate) data.incidentDate = new Date(dto.incidentDate);
      
      return await this.prisma.incident.update({
        where: { id },
        data,
      });
    } catch (e) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
  }

  async removeIncident(id: string) {
    try {
      return await this.prisma.incident.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
  }

  // Audits
  async createAudit(dto: CreateAuditDto) {
    const data: Prisma.SafetyAuditCreateInput = {
      ...dto,
      auditDate: new Date(dto.auditDate),
    };
    return this.prisma.safetyAudit.create({ data });
  }

  async findAllAudits(query: HseQueryDto) {
    const { limit = 20, page = 1, site } = query;
    const where: Prisma.SafetyAuditWhereInput = site 
      ? { site: { contains: site, mode: 'insensitive' } } 
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.safetyAudit.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { auditDate: 'desc' },
      }),
      this.prisma.safetyAudit.count({ where }),
    ]);

    return { data, total, limit, page };
  }

  async updateAudit(id: string, dto: Partial<CreateAuditDto>) {
    try {
      const data: Prisma.SafetyAuditUpdateInput = { ...dto };
      if (dto.auditDate) data.auditDate = new Date(dto.auditDate);
      
      return await this.prisma.safetyAudit.update({
        where: { id },
        data,
      });
    } catch (e) {
      throw new NotFoundException(`Audit ${id} not found`);
    }
  }

  async removeAudit(id: string) {
    try {
      return await this.prisma.safetyAudit.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException(`Audit ${id} not found`);
    }
  }

  // Drills
  async createDrill(dto: CreateDrillDto) {
    const data: Prisma.HseDrillCreateInput = {
      ...dto,
      drillDate: new Date(dto.drillDate),
    };
    return this.prisma.hseDrill.create({ data });
  }

  async findAllDrills(query: HseQueryDto) {
    const { limit = 20, page = 1, site } = query;
    const where: Prisma.HseDrillWhereInput = site 
      ? { location: { contains: site, mode: 'insensitive' } } 
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.hseDrill.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { drillDate: 'desc' },
      }),
      this.prisma.hseDrill.count({ where }),
    ]);

    return { data, total, limit, page };
  }

  async updateDrill(id: string, dto: Partial<CreateDrillDto>) {
    try {
      const data: Prisma.HseDrillUpdateInput = { ...dto };
      if (dto.drillDate) data.drillDate = new Date(dto.drillDate);
      
      return await this.prisma.hseDrill.update({
        where: { id },
        data,
      });
    } catch (e) {
      throw new NotFoundException(`Drill ${id} not found`);
    }
  }

  async removeDrill(id: string) {
    try {
      return await this.prisma.hseDrill.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException(`Drill ${id} not found`);
    }
  }

  async getStats() {
    const [severityData, statusData, auditData] = await Promise.all([
      this.prisma.incident.groupBy({
        by: ['severity'],
        _count: { _all: true },
      }),
      this.prisma.incident.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.safetyAudit.aggregate({
        _avg: { score: true },
      }),
    ]);

    const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
    severityData.forEach(d => {
      const s = d.severity as keyof typeof severityCount;
      if (s in severityCount) severityCount[s] = d._count._all;
    });

    const statusCount = { open: 0, investigating: 0, closed: 0 };
    statusData.forEach(d => {
      const s = d.status as keyof typeof statusCount;
      if (s in statusCount) statusCount[s] = d._count._all;
    });

    return { 
      severityCount, 
      statusCount, 
      avgAuditScore: auditData._avg.score || 100 
    };
  }
}
