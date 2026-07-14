import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { supplierSchema } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult, decimalStr } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';
import { serializeRecord, serializeMany } from '../../common/utils/serialize';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortBy, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.SupplierWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { tradeLicense: { contains: search } },
      ];
    }

    const orderBy: Prisma.SupplierOrderByWithRelationInput = {};
    const allowedSort = ['name', 'phone', 'createdAt', 'currentBalance'] as const;
    const field = allowedSort.includes(sortBy as (typeof allowedSort)[number])
      ? (sortBy as (typeof allowedSort)[number])
      : 'createdAt';
    orderBy[field] = sortDir as Prisma.SortOrder;

    const [rows, total] = await Promise.all([
      this.prisma.supplier.findMany({ where, skip, take, orderBy }),
      this.prisma.supplier.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return serializeRecord(supplier);
  }

  async create(body: unknown, userId?: string) {
    const dto = zodValidate(supplierSchema, body);
    const openingBalance = dto.openingBalance ?? '0.000';

    const supplier = await this.prisma.supplier.create({
      data: {
        name: dto.name,
        phone: dto.phone ?? null,
        email: dto.email || null,
        address: dto.address ?? null,
        tradeLicense: dto.tradeLicense ?? null,
        openingBalance,
        currentBalance: openingBalance,
        notes: dto.notes ?? null,
        createdById: userId,
        updatedById: userId,
      },
    });

    return serializeRecord(supplier);
  }

  async update(id: string, body: unknown, userId?: string) {
    await this.findOne(id);
    const dto = zodValidate(supplierSchema.partial(), body);

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        ...dto,
        email: dto.email === '' ? null : dto.email,
        updatedById: userId,
      },
    });

    return serializeRecord(supplier);
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });
    return serializeRecord(supplier);
  }

  async getLedger(id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const [purchasesAgg, paymentsAgg, recentPurchases] = await Promise.all([
      this.prisma.purchaseInvoice.aggregate({
        where: { supplierId: id, deletedAt: null, status: 'POSTED' },
        _sum: { total: true, paid: true, balance: true },
        _count: true,
      }),
      this.prisma.purchasePayment.aggregate({
        where: { purchaseInvoice: { supplierId: id, deletedAt: null } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.purchaseInvoice.findMany({
        where: { supplierId: id, deletedAt: null },
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
      supplierId: id,
      currentBalance: decimalStr(supplier.currentBalance),
      openingBalance: decimalStr(supplier.openingBalance),
      purchases: {
        count: purchasesAgg._count,
        total: decimalStr(purchasesAgg._sum.total),
        paid: decimalStr(purchasesAgg._sum.paid),
        balance: decimalStr(purchasesAgg._sum.balance),
      },
      payments: {
        count: paymentsAgg._count,
        total: decimalStr(paymentsAgg._sum.amount),
      },
      recentPurchases: recentPurchases.map((p) => ({
        ...p,
        total: decimalStr(p.total),
        paid: decimalStr(p.paid),
        balance: decimalStr(p.balance),
      })),
    };
  }
}
