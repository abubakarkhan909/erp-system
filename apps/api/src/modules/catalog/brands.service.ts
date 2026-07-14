import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';

const brandSchema = z.object({
  name: z.string().min(1).max(200),
});

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.BrandWhereInput = { deletedAt: null };
    if (search) {
      where.name = { contains: search };
    }

    const [rows, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        skip,
        take,
        orderBy: { name: sortDir as Prisma.SortOrder },
      }),
      this.prisma.brand.count({ where }),
    ]);

    return paginatedResult(rows, total, page, pageSize);
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(body: unknown) {
    const dto = zodValidate(brandSchema, body);
    try {
      return await this.prisma.brand.create({ data: { name: dto.name } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Brand name already exists');
      }
      throw e;
    }
  }

  async update(id: string, body: unknown) {
    await this.findOne(id);
    const dto = zodValidate(brandSchema.partial(), body);
    try {
      return await this.prisma.brand.update({ where: { id }, data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Brand name already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
