import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UtilityBillStatus, UtilityBillType } from '@prisma/client';
import { moneySchema, roundMoney } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { serializeMany, serializeRecord } from '../../common/utils/serialize';
import { zodValidate } from '../../common/utils/zod-validate';
import { z } from 'zod';

const utilityBillSchema = z.object({
  type: z.nativeEnum(UtilityBillType),
  billNumber: z.string().max(100).optional().nullable(),
  dueDate: z.string().or(z.coerce.date()),
  amount: moneySchema,
  notes: z.string().max(500).optional().nullable(),
});

const markPaidSchema = z.object({
  paidDate: z.string().or(z.coerce.date()).optional(),
  createExpense: z.boolean().default(false),
  categoryId: z.string().cuid().optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'MIXED']).optional(),
  bankAccountId: z.string().cuid().optional().nullable(),
});

@Injectable()
export class UtilityBillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expensesService: ExpensesService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.UtilityBillWhereInput = {};
    if (query.status) where.status = query.status as UtilityBillStatus;
    if (query.type) where.type = query.type as UtilityBillType;

    const [rows, total] = await Promise.all([
      this.prisma.utilityBill.findMany({
        where,
        skip,
        take,
        orderBy: { dueDate: 'asc' },
        include: { expense: true },
      }),
      this.prisma.utilityBill.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const bill = await this.prisma.utilityBill.findUnique({
      where: { id },
      include: { expense: true },
    });
    if (!bill) throw new NotFoundException('Utility bill not found');
    return serializeRecord(bill);
  }

  async create(body: unknown) {
    const dto = zodValidate(utilityBillSchema, body);

    const bill = await this.prisma.utilityBill.create({
      data: {
        type: dto.type,
        billNumber: dto.billNumber ?? null,
        dueDate: new Date(dto.dueDate),
        amount: roundMoney(dto.amount),
        status: UtilityBillStatus.PENDING,
        notes: dto.notes ?? null,
      },
    });

    return serializeRecord(bill);
  }

  async update(id: string, body: unknown) {
    await this.findOne(id);
    const dto = zodValidate(utilityBillSchema.partial(), body);

    const bill = await this.prisma.utilityBill.update({
      where: { id },
      data: {
        type: dto.type,
        billNumber: dto.billNumber,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        amount: dto.amount ? roundMoney(dto.amount) : undefined,
        notes: dto.notes,
      },
    });

    return serializeRecord(bill);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.utilityBill.delete({ where: { id } });
    return { deleted: true };
  }

  async markPaid(id: string, body: unknown, userId?: string) {
    const dto = zodValidate(markPaidSchema, body);
    const bill = await this.prisma.utilityBill.findUnique({ where: { id } });
    if (!bill) throw new NotFoundException('Utility bill not found');

    if (bill.status === UtilityBillStatus.PAID) {
      return this.findOne(id);
    }

    let expenseId: string | null = null;
    const amount = roundMoney(bill.amount.toString());

    if (dto.createExpense) {
      if (!dto.categoryId) {
        throw new NotFoundException('categoryId required when createExpense is true');
      }
      const expense = await this.expensesService.create(
        {
          expenseDate: dto.paidDate ?? new Date(),
          categoryId: dto.categoryId,
          amount,
          paymentMethod: dto.paymentMethod ?? 'CASH',
          bankAccountId: dto.bankAccountId,
          reference: bill.billNumber,
          notes: `Utility bill ${bill.type}`,
        },
        userId,
      );
      expenseId = expense.id as string;
    }

    const updated = await this.prisma.utilityBill.update({
      where: { id },
      data: {
        status: UtilityBillStatus.PAID,
        paidDate: dto.paidDate ? new Date(dto.paidDate) : new Date(),
        expenseId,
      },
      include: { expense: true },
    });

    return serializeRecord(updated);
  }
}
