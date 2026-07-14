import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { moneySchema, roundMoney } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { ACCOUNT_CODES } from '../accounting/accounting.constants';
import { NumberSeriesService } from '../number-series/number-series.service';
import { zodValidate } from '../../common/utils/zod-validate';
import { z } from 'zod';

const customerPaymentSchema = z.object({
  customerId: z.string().cuid(),
  amount: moneySchema,
  paymentDate: z.string().or(z.coerce.date()).optional(),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  bankAccountId: z.string().cuid().optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  memo: z.string().max(500).optional().nullable(),
});

const supplierPaymentSchema = z.object({
  supplierId: z.string().cuid(),
  amount: moneySchema,
  paymentDate: z.string().or(z.coerce.date()).optional(),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  bankAccountId: z.string().cuid().optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  memo: z.string().max(500).optional().nullable(),
});

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounting: AccountingService,
    private readonly numberSeries: NumberSeriesService,
  ) {}

  async recordCustomerPayment(body: unknown, userId?: string) {
    const dto = zodValidate(customerPaymentSchema, body);
    const amount = roundMoney(dto.amount);
    if (parseFloat(amount) <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: dto.customerId, deletedAt: null },
      });
      if (!customer) throw new NotFoundException('Customer not found');

      const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
      const refNumber = await this.numberSeries.nextNumber('CUST_PAY', 'CP', tx);

      await tx.customer.update({
        where: { id: dto.customerId },
        data: { currentBalance: { decrement: amount } },
      });

      const assetAccount =
        dto.method === PaymentMethod.CASH ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.BANK;

      if (dto.method !== PaymentMethod.CASH && dto.bankAccountId) {
        await tx.bankAccount.update({
          where: { id: dto.bankAccountId },
          data: { currentBalance: { increment: amount } },
        });
        await tx.bankTransaction.create({
          data: {
            bankAccountId: dto.bankAccountId,
            type: 'DEPOSIT',
            amount,
            reference: dto.reference ?? refNumber,
            memo: dto.memo ?? `Customer payment ${refNumber}`,
            txnDate: paymentDate,
            createdById: userId,
          },
        });
      } else if (dto.method === PaymentMethod.CASH) {
        await this.recordCashTx(tx, 'IN', amount, 'CUSTOMER_PAYMENT', refNumber, userId);
      }

      const journal = await this.accounting.postJournal(tx, {
        entryDate: paymentDate,
        memo: dto.memo ?? `Customer payment ${refNumber}`,
        sourceType: 'CUSTOMER_PAYMENT',
        sourceId: dto.customerId,
        createdById: userId,
        lines: [
          {
            accountCode: assetAccount,
            debit: amount,
            credit: '0.000',
          },
          {
            accountCode: ACCOUNT_CODES.AR,
            debit: '0.000',
            credit: amount,
            partyType: 'CUSTOMER',
            partyId: dto.customerId,
            narration: dto.reference ?? undefined,
          },
        ],
      });

      return {
        reference: refNumber,
        customerId: dto.customerId,
        amount,
        method: dto.method,
        journalId: journal.id,
        journalNumber: journal.number,
      };
    });
  }

  async recordSupplierPayment(body: unknown, userId?: string) {
    const dto = zodValidate(supplierPaymentSchema, body);
    const amount = roundMoney(dto.amount);
    if (parseFloat(amount) <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id: dto.supplierId, deletedAt: null },
      });
      if (!supplier) throw new NotFoundException('Supplier not found');

      const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
      const refNumber = await this.numberSeries.nextNumber('SUPP_PAY', 'SP', tx);

      await tx.supplier.update({
        where: { id: dto.supplierId },
        data: { currentBalance: { decrement: amount } },
      });

      const assetAccount =
        dto.method === PaymentMethod.CASH ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.BANK;

      if (dto.method !== PaymentMethod.CASH && dto.bankAccountId) {
        await tx.bankAccount.update({
          where: { id: dto.bankAccountId },
          data: { currentBalance: { decrement: amount } },
        });
        await tx.bankTransaction.create({
          data: {
            bankAccountId: dto.bankAccountId,
            type: 'WITHDRAW',
            amount,
            reference: dto.reference ?? refNumber,
            memo: dto.memo ?? `Supplier payment ${refNumber}`,
            txnDate: paymentDate,
            createdById: userId,
          },
        });
      } else if (dto.method === PaymentMethod.CASH) {
        await this.recordCashTx(tx, 'OUT', amount, 'SUPPLIER_PAYMENT', refNumber, userId);
      }

      const journal = await this.accounting.postJournal(tx, {
        entryDate: paymentDate,
        memo: dto.memo ?? `Supplier payment ${refNumber}`,
        sourceType: 'SUPPLIER_PAYMENT',
        sourceId: dto.supplierId,
        createdById: userId,
        lines: [
          {
            accountCode: ACCOUNT_CODES.AP,
            debit: amount,
            credit: '0.000',
            partyType: 'SUPPLIER',
            partyId: dto.supplierId,
            narration: dto.reference ?? undefined,
          },
          {
            accountCode: assetAccount,
            debit: '0.000',
            credit: amount,
          },
        ],
      });

      return {
        reference: refNumber,
        supplierId: dto.supplierId,
        amount,
        method: dto.method,
        journalId: journal.id,
        journalNumber: journal.number,
      };
    });
  }

  private async recordCashTx(
    tx: Prisma.TransactionClient,
    type: 'IN' | 'OUT',
    amount: string,
    refType: string,
    refId: string,
    userId?: string,
  ) {
    const openSession = await tx.cashSession.findFirst({
      where: { status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });
    await tx.cashTransaction.create({
      data: {
        cashSessionId: openSession?.id ?? null,
        type,
        amount,
        reason: refType,
        refType,
        refId,
        createdById: userId,
      },
    });
  }
}
