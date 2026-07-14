import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { moneySchema, roundMoney } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { ACCOUNT_CODES } from '../accounting/accounting.constants';
import { NumberSeriesService } from '../number-series/number-series.service';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { serializeMany, serializeRecord } from '../../common/utils/serialize';
import { zodValidate } from '../../common/utils/zod-validate';
import { z } from 'zod';

const expenseSchema = z.object({
  expenseDate: z.string().or(z.coerce.date()).optional(),
  categoryId: z.string().cuid(),
  amount: moneySchema,
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  bankAccountId: z.string().cuid().optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounting: AccountingService,
    private readonly numberSeries: NumberSeriesService,
  ) {}

  async listCategories() {
    const categories = await this.prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.ExpenseWhereInput = {};
    if (query.categoryId) where.categoryId = String(query.categoryId);

    const [rows, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { expenseDate: 'desc' },
        include: { category: true },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return serializeRecord(expense);
  }

  async create(body: unknown, userId?: string) {
    const dto = zodValidate(expenseSchema, body);
    const amount = roundMoney(dto.amount);
    const expenseDate = dto.expenseDate ? new Date(dto.expenseDate) : new Date();

    return this.prisma.$transaction(async (tx) => {
      const category = await tx.expenseCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Expense category not found');

      const number = await this.numberSeries.nextNumber('EXPENSE', 'EXP', tx);

      const expense = await tx.expense.create({
        data: {
          number,
          expenseDate,
          categoryId: dto.categoryId,
          amount,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
          bankAccountId: dto.bankAccountId ?? null,
          reference: dto.reference ?? null,
          notes: dto.notes ?? null,
          createdById: userId,
        },
        include: { category: true },
      });

      const assetAccount =
        dto.paymentMethod === PaymentMethod.CASH
          ? ACCOUNT_CODES.CASH
          : ACCOUNT_CODES.BANK;

      if (dto.paymentMethod !== PaymentMethod.CASH && dto.bankAccountId) {
        await tx.bankAccount.update({
          where: { id: dto.bankAccountId },
          data: { currentBalance: { decrement: amount } },
        });
        await tx.bankTransaction.create({
          data: {
            bankAccountId: dto.bankAccountId,
            type: 'WITHDRAW',
            amount,
            reference: number,
            memo: `Expense ${number}`,
            txnDate: expenseDate,
            createdById: userId,
          },
        });
      } else if (dto.paymentMethod === PaymentMethod.CASH) {
        const openSession = await tx.cashSession.findFirst({
          where: { status: 'OPEN' },
          orderBy: { openedAt: 'desc' },
        });
        await tx.cashTransaction.create({
          data: {
            cashSessionId: openSession?.id ?? null,
            type: 'OUT',
            amount,
            reason: 'EXPENSE',
            refType: 'EXPENSE',
            refId: expense.id,
            createdById: userId,
          },
        });
      }

      await this.accounting.postJournal(tx, {
        entryDate: expenseDate,
        memo: `Expense ${number} - ${category.name}`,
        sourceType: 'EXPENSE',
        sourceId: expense.id,
        createdById: userId,
        lines: [
          {
            accountCode: ACCOUNT_CODES.EXPENSES,
            debit: amount,
            credit: '0.000',
            narration: category.name,
          },
          {
            accountCode: assetAccount,
            debit: '0.000',
            credit: amount,
          },
        ],
      });

      return serializeRecord(expense);
    });
  }

  async update(id: string, body: unknown) {
    await this.findOne(id);
    const dto = zodValidate(expenseSchema.partial(), body);

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
        categoryId: dto.categoryId,
        amount: dto.amount ? roundMoney(dto.amount) : undefined,
        paymentMethod: dto.paymentMethod,
        bankAccountId: dto.bankAccountId,
        reference: dto.reference,
        notes: dto.notes,
      },
      include: { category: true },
    });

    return serializeRecord(expense);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    return { deleted: true };
  }
}
