import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DropdownsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category: string) {
    return this.prisma.dropdownOption.findMany({
      where: { category },
      orderBy: { label: 'asc' },
    });
  }

  async create(category: string, data: { label: string; value: string }) {
    try {
      return await this.prisma.dropdownOption.create({
        data: {
          category,
          label: data.label,
          value: data.value,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Option already exists for this category');
      }
      throw error;
    }
  }

  async delete(id: string) {
    return this.prisma.dropdownOption.delete({
      where: { id },
    });
  }
}
