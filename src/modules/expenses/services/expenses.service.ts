import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, UpdateExpenseStatusDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: ExpenseQueryDto): Promise<PaginatedResponseDto<Expense>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', category, status, site } = query;
    const qb = this.repo.createQueryBuilder('e');

    if (search) {
      qb.andWhere('(e.title ILIKE :s OR e.description ILIKE :s)', { s: `%${search}%` });
    }
    if (category) qb.andWhere('e.category = :category', { category });
    if (status) qb.andWhere('e.status = :status', { status });
    if (site) qb.andWhere('e.site ILIKE :site', { site: `%${site}%` });

    const allowed = ['createdAt', 'amount', 'dateIncurred', 'title'];
    const col = allowed.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`e.${col}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Expense> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Expense "${id}" not found`);
    return e;
  }

  async getStats() {
    const expenses = await this.repo.find();
    const totalSpent = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    const pendingApproval = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      if (e.status === 'approved') {
        byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
      }
    }

    return {
      totalSpent,
      pendingApproval,
      totalExpenditure: totalSpent + pendingApproval,
      byCategory,
    };
  }

  async getTrends() {
    const expenses = await this.repo.find({
      order: { dateIncurred: 'ASC' }
    });

    const monthly: Record<string, number> = {};
    for (const e of expenses) {
      if (e.status === 'approved') {
        const date = new Date(e.dateIncurred);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthly[key] = (monthly[key] || 0) + Number(e.amount);
      }
    }

    const labels = Object.keys(monthly).sort();
    return labels.map(label => ({
      month: label,
      amount: monthly[label]
    }));
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, dto);
    return this.repo.save(expense);
  }

  async updateStatus(id: string, dto: UpdateExpenseStatusDto): Promise<Expense> {
    const expense = await this.findOne(id);
    expense.status = dto.status;
    expense.remarks = dto.remarks ?? null;
    return this.repo.save(expense);
  }

  async remove(id: string) {
    const expense = await this.findOne(id);
    await this.repo.remove(expense);
    return { message: 'Expense deleted' };
  }
}
