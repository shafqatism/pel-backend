import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
  ) {}

  async create(dto: CreateDocumentDto): Promise<Document> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: DocumentQueryDto): Promise<PaginatedResponseDto<Document>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', category, department, site } = query;
    const qb = this.repo.createQueryBuilder('d');

    if (search) {
      qb.andWhere('(d.title ILIKE :s OR d.description ILIKE :s)', { s: `%${search}%` });
    }
    if (category) qb.andWhere('d.category = :category', { category });
    if (department) qb.andWhere('d.department = :department', { department });
    if (site) qb.andWhere('d.site ILIKE :site', { site: `%${site}%` });

    qb.orderBy(`d.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Document> {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Document "${id}" not found`);
    return d;
  }

  async update(id: string, dto: UpdateDocumentDto): Promise<Document> {
    const doc = await this.findOne(id);
    Object.assign(doc, dto);
    return this.repo.save(doc);
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    await this.repo.remove(doc);
    return { message: 'Document deleted' };
  }
}
