import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { goldRateSchema } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';
import { serializeRecord, serializeMany } from '../../common/utils/serialize';

function toDateOnly(value: string | Date): Date {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class GoldRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const [rows, total] = await Promise.all([
      this.prisma.goldRate.findMany({
        skip,
        take,
        orderBy: [{ rateDate: sortDir as Prisma.SortOrder }, { karat: 'asc' }],
      }),
      this.prisma.goldRate.count(),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const rate = await this.prisma.goldRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException('Gold rate not found');
    return serializeRecord(rate);
  }

  async findByDate(dateStr: string) {
    const rateDate = toDateOnly(dateStr);
    const rates = await this.prisma.goldRate.findMany({
      where: { rateDate },
      orderBy: { karat: 'asc' },
    });
    return {
      rateDate: rateDate.toISOString().slice(0, 10),
      rates: serializeMany(rates),
    };
  }

  async findLatest() {
    const latest = await this.prisma.goldRate.findFirst({
      orderBy: { rateDate: 'desc' },
    });

    if (!latest) {
      return { rateDate: null, rates: [] };
    }

    const rates = await this.prisma.goldRate.findMany({
      where: { rateDate: latest.rateDate },
      orderBy: { karat: 'asc' },
    });

    return {
      rateDate: latest.rateDate.toISOString().slice(0, 10),
      rates: serializeMany(rates),
    };
  }

  async upsert(body: unknown, userId?: string) {
    const dto = zodValidate(goldRateSchema, body);
    const rateDate = toDateOnly(dto.rateDate);

    const rate = await this.prisma.goldRate.upsert({
      where: {
        rateDate_karat: { rateDate, karat: dto.karat },
      },
      create: {
        rateDate,
        karat: dto.karat,
        ratePerGram: dto.ratePerGram,
        createdById: userId,
      },
      update: {
        ratePerGram: dto.ratePerGram,
      },
    });

    return serializeRecord(rate);
  }

  async create(body: unknown, userId?: string) {
    return this.upsert(body, userId);
  }

  async update(id: string, body: unknown) {
    await this.findOne(id);
    const dto = zodValidate(goldRateSchema.partial(), body);

    const data: Prisma.GoldRateUpdateInput = {};
    if (dto.ratePerGram !== undefined) data.ratePerGram = dto.ratePerGram;
    if (dto.karat !== undefined) data.karat = dto.karat;
    if (dto.rateDate !== undefined) data.rateDate = toDateOnly(dto.rateDate);

    const rate = await this.prisma.goldRate.update({
      where: { id },
      data,
    });

    return serializeRecord(rate);
  }

  async remove(id: string) {
    await this.findOne(id);
    const rate = await this.prisma.goldRate.delete({ where: { id } });
    return serializeRecord(rate);
  }
}
