import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, UpdateExpenseStatusDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseDto) {
    const data: Prisma.ExpenseCreateInput = {
      ...dto,
      dateIncurred: new Date(dto.dateIncurred),
      amount: Number(dto.amount),
    };
    const expense = await this.prisma.expense.create({ data });
    
    // Convert Decimal to number for response
    return {
      ...expense,
      amount: Number(expense.amount),
    };
  }

  async findAll(query: ExpenseQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', category, status, site } = query;
    const where: Prisma.ExpenseWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;
    if (site) where.site = { contains: site, mode: 'insensitive' };

    const allowed = ['createdAt', 'amount', 'dateIncurred', 'title'];
    const col = allowed.includes(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [col]: sortOrder.toLowerCase() },
      }),
      this.prisma.expense.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const convertedData = data.map(expense => ({
      ...expense,
      amount: Number(expense.amount),
    }));

    return new PaginatedResponseDto(convertedData as any, total, page, limit);
  }

  async findOne(id: string) {
    const e = await this.prisma.expense.findUnique({ where: { id } });
    if (!e) throw new NotFoundException(`Expense "${id}" not found`);
    
    // Convert Decimal to number for response
    return {
      ...e,
      amount: Number(e.amount),
    };
  }

  async getStats() {
    const [spent, pending, total, cats] = await Promise.all([
      this.prisma.expense.aggregate({
        where: { status: 'approved' },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where: { status: 'approved' },
        _sum: { amount: true },
      }),
    ]);

    const byCategory: Record<string, number> = {};
    cats.forEach(c => byCategory[c.category] = Number(c._sum.amount || 0));

    return {
      totalSpent: Number(spent._sum.amount || 0),
      pendingApproval: Number(pending._sum.amount || 0),
      totalExpenditure: Number(total._sum.amount || 0),
      byCategory,
    };
  }

  async getTrends() {
    const expenses = await this.prisma.expense.findMany({
      where: { status: 'approved' },
      orderBy: { dateIncurred: 'asc' },
    });

    const monthly: Record<string, number> = {};
    for (const e of expenses) {
      const date = new Date(e.dateIncurred);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + Number(e.amount);
    }

    return Object.keys(monthly).sort().map(label => ({
      month: label,
      amount: monthly[label]
    }));
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);
    const data: Prisma.ExpenseUpdateInput = { ...dto };
    if (dto.dateIncurred) data.dateIncurred = new Date(dto.dateIncurred);
    if (dto.amount !== undefined) data.amount = Number(dto.amount);
    
    const expense = await this.prisma.expense.update({
      where: { id },
      data,
    });
    
    // Convert Decimal to number for response
    return {
      ...expense,
      amount: Number(expense.amount),
    };
  }

  async updateStatus(id: string, dto: UpdateExpenseStatusDto) {
    await this.findOne(id);
    return this.prisma.expense.update({
      where: { id },
      data: {
        status: dto.status,
        remarks: dto.remarks ?? null,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted' };
  }
}
