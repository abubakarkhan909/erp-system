import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { customerSchema } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult, decimalStr } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';
import { serializeRecord, serializeMany } from '../../common/utils/serialize';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortBy, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.CustomerWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { civilId: { contains: search } },
      ];
    }

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {};
    const allowedSort = ['name', 'phone', 'createdAt', 'currentBalance'] as const;
    const field = allowedSort.includes(sortBy as (typeof allowedSort)[number])
      ? (sortBy as (typeof allowedSort)[number])
      : 'createdAt';
    orderBy[field] = sortDir as Prisma.SortOrder;

    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({ where, skip, take, orderBy }),
      this.prisma.customer.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return serializeRecord(customer);
  }

  async create(body: unknown, userId?: string) {
    const dto = zodValidate(customerSchema, body);
    const openingBalance = dto.openingBalance ?? '0.000';

    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        phone: dto.phone ?? null,
        email: dto.email || null,
        address: dto.address ?? null,
        civilId: dto.civilId ?? null,
        openingBalance,
        currentBalance: openingBalance,
        notes: dto.notes ?? null,
        createdById: userId,
        updatedById: userId,
      },
    });

    return serializeRecord(customer);
  }

  async update(id: string, body: unknown, userId?: string) {
    await this.findOne(id);
    const dto = zodValidate(customerSchema.partial(), body);

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...dto,
        email: dto.email === '' ? null : dto.email,
        updatedById: userId,
      },
    });

    return serializeRecord(customer);
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const customer = await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });
    return serializeRecord(customer);
  }

  async getLedger(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const [salesAgg, paymentsAgg, recentSales] = await Promise.all([
      this.prisma.saleInvoice.aggregate({
        where: { customerId: id, deletedAt: null, status: 'POSTED' },
        _sum: { total: true, paid: true, balance: true },
        _count: true,
      }),
      this.prisma.salePayment.aggregate({
        where: { saleInvoice: { customerId: id, deletedAt: null } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.saleInvoice.findMany({
        where: { customerId: id, deletedAt: null },
        orderBy: { invoiceDate: 'desc' },
        take: 10,
        select: {
          id: true,
          number: true,
          invoiceDate: true,
          status: true,
          total: true,
          paid: true,
          balance: true,
        },
      }),
    ]);

    return {
      customerId: id,
      currentBalance: decimalStr(customer.currentBalance),
      openingBalance: decimalStr(customer.openingBalance),
      sales: {
        count: salesAgg._count,
        total: decimalStr(salesAgg._sum.total),
        paid: decimalStr(salesAgg._sum.paid),
        balance: decimalStr(salesAgg._sum.balance),
      },
      payments: {
        count: paymentsAgg._count,
        total: decimalStr(paymentsAgg._sum.amount),
      },
      recentSales: recentSales.map((s) => ({
        ...s,
        total: decimalStr(s.total),
        paid: decimalStr(s.paid),
        balance: decimalStr(s.balance),
      })),
    };
  }
}
