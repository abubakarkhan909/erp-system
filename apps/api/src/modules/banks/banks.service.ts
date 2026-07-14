import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BankTxnType, Prisma } from '@prisma/client';
import { moneySchema, roundMoney } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { ACCOUNT_CODES } from '../accounting/accounting.constants';
import { decimalStr } from '../../common/utils/pagination';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { serializeMany, serializeRecord } from '../../common/utils/serialize';
import { zodValidate } from '../../common/utils/zod-validate';
import { z } from 'zod';

const bankAccountSchema = z.object({
  name: z.string().min(1).max(200),
  bankName: z.string().min(1).max(200),
  accountNo: z.string().max(50).optional().nullable(),
  iban: z.string().max(50).optional().nullable(),
  openingBalance: moneySchema.default('0.000'),
  isActive: z.boolean().default(true),
});

const txnSchema = z.object({
  amount: moneySchema,
  reference: z.string().max(100).optional().nullable(),
  memo: z.string().max(500).optional().nullable(),
  txnDate: z.string().or(z.coerce.date()).optional(),
});

const transferSchema = txnSchema.extend({
  fromAccountId: z.string().cuid(),
  toAccountId: z.string().cuid(),
});

@Injectable()
export class BanksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounting: AccountingService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.BankAccountWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { bankName: { contains: search } },
        { accountNo: { contains: search } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.bankAccount.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      this.prisma.bankAccount.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Bank account not found');
    return serializeRecord(account);
  }

  async create(body: unknown) {
    const dto = zodValidate(bankAccountSchema, body);
    const opening = roundMoney(dto.openingBalance ?? '0.000');

    const account = await this.prisma.bankAccount.create({
      data: {
        name: dto.name,
        bankName: dto.bankName,
        accountNo: dto.accountNo ?? null,
        iban: dto.iban ?? null,
        openingBalance: opening,
        currentBalance: opening,
        isActive: dto.isActive,
      },
    });

    return serializeRecord(account);
  }

  async update(id: string, body: unknown) {
    await this.findOne(id);
    const dto = zodValidate(bankAccountSchema.partial(), body);

    const account = await this.prisma.bankAccount.update({
      where: { id },
      data: {
        name: dto.name,
        bankName: dto.bankName,
        accountNo: dto.accountNo,
        iban: dto.iban,
        isActive: dto.isActive,
      },
    });

    return serializeRecord(account);
  }

  async remove(id: string) {
    await this.findOne(id);
    const account = await this.prisma.bankAccount.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return serializeRecord(account);
  }

  async deposit(id: string, body: unknown, userId?: string) {
    return this.recordTxn(id, 'DEPOSIT', body, userId);
  }

  async withdraw(id: string, body: unknown, userId?: string) {
    return this.recordTxn(id, 'WITHDRAW', body, userId);
  }

  async transfer(body: unknown, userId?: string) {
    const dto = zodValidate(transferSchema, body);
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    const amount = roundMoney(dto.amount);
    const txnDate = dto.txnDate ? new Date(dto.txnDate) : new Date();

    return this.prisma.$transaction(async (tx) => {
      await this.ensureAccount(tx, dto.fromAccountId);
      await this.ensureAccount(tx, dto.toAccountId);

      const fromBal = await tx.bankAccount.findUnique({ where: { id: dto.fromAccountId } });
      if (parseFloat(decimalStr(fromBal!.currentBalance)) < parseFloat(amount)) {
        throw new BadRequestException('Insufficient bank balance');
      }

      await tx.bankAccount.update({
        where: { id: dto.fromAccountId },
        data: { currentBalance: { decrement: amount } },
      });
      await tx.bankAccount.update({
        where: { id: dto.toAccountId },
        data: { currentBalance: { increment: amount } },
      });

      const outTxn = await tx.bankTransaction.create({
        data: {
          bankAccountId: dto.fromAccountId,
          type: BankTxnType.TRANSFER,
          amount,
          contraAccountId: dto.toAccountId,
          reference: dto.reference ?? null,
          memo: dto.memo ?? 'Bank transfer out',
          txnDate,
          createdById: userId,
        },
      });

      const inTxn = await tx.bankTransaction.create({
        data: {
          bankAccountId: dto.toAccountId,
          type: BankTxnType.TRANSFER,
          amount,
          contraAccountId: dto.fromAccountId,
          reference: dto.reference ?? null,
          memo: dto.memo ?? 'Bank transfer in',
          txnDate,
          createdById: userId,
        },
      });

      await this.accounting.postJournal(tx, {
        entryDate: txnDate,
        memo: dto.memo ?? 'Bank transfer',
        sourceType: 'BANK_TRANSFER',
        sourceId: outTxn.id,
        createdById: userId,
        lines: [
          { accountCode: ACCOUNT_CODES.BANK, debit: amount, credit: '0.000' },
          { accountCode: ACCOUNT_CODES.BANK, debit: '0.000', credit: amount },
        ],
      });

      return { outTxn: serializeRecord(outTxn), inTxn: serializeRecord(inTxn) };
    });
  }

  private async recordTxn(
    bankAccountId: string,
    type: BankTxnType,
    body: unknown,
    userId?: string,
  ) {
    const dto = zodValidate(txnSchema, body);
    const amount = roundMoney(dto.amount);
    const txnDate = dto.txnDate ? new Date(dto.txnDate) : new Date();

    return this.prisma.$transaction(async (tx) => {
      await this.ensureAccount(tx, bankAccountId);

      if (type === BankTxnType.WITHDRAW) {
        const acct = await tx.bankAccount.findUnique({ where: { id: bankAccountId } });
        if (parseFloat(decimalStr(acct!.currentBalance)) < parseFloat(amount)) {
          throw new BadRequestException('Insufficient bank balance');
        }
        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: { currentBalance: { decrement: amount } },
        });
      } else {
        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: { currentBalance: { increment: amount } },
        });
      }

      const bankTxn = await tx.bankTransaction.create({
        data: {
          bankAccountId,
          type,
          amount,
          reference: dto.reference ?? null,
          memo: dto.memo ?? null,
          txnDate,
          createdById: userId,
        },
      });

      const lines =
        type === BankTxnType.DEPOSIT
          ? [
              { accountCode: ACCOUNT_CODES.BANK, debit: amount, credit: '0.000' },
              { accountCode: ACCOUNT_CODES.CASH, debit: '0.000', credit: amount },
            ]
          : [
              { accountCode: ACCOUNT_CODES.CASH, debit: amount, credit: '0.000' },
              { accountCode: ACCOUNT_CODES.BANK, debit: '0.000', credit: amount },
            ];

      await this.accounting.postJournal(tx, {
        entryDate: txnDate,
        memo: dto.memo ?? `Bank ${type.toLowerCase()}`,
        sourceType: `BANK_${type}`,
        sourceId: bankTxn.id,
        createdById: userId,
        lines,
      });

      return serializeRecord(bankTxn);
    });
  }

  private async ensureAccount(tx: Prisma.TransactionClient, id: string) {
    const account = await tx.bankAccount.findFirst({ where: { id, deletedAt: null } });
    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }
}
