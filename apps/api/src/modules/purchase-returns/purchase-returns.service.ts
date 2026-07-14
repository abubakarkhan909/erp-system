import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { addMoney, calcVat, moneySchema, roundMoney } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
import { InventoryService } from '../inventory/inventory.service';
import { AccountingService, JournalLineInput } from '../accounting/accounting.service';
import { ACCOUNT_CODES } from '../accounting/accounting.constants';
import { decimalStr } from '../../common/utils/pagination';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { serializeMany, serializeRecord } from '../../common/utils/serialize';
import { zodValidate } from '../../common/utils/zod-validate';
import { z } from 'zod';

const purchaseReturnItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  netWeight: moneySchema.default('0.000'),
  lineNet: moneySchema,
  vatRate: moneySchema.default('5.000'),
});

const createPurchaseReturnSchema = z.object({
  purchaseInvoiceId: z.string().cuid(),
  returnDate: z.string().or(z.coerce.date()).optional(),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(purchaseReturnItemSchema).min(1),
  refundAmount: moneySchema.optional(),
  refundMethod: z.nativeEnum(PaymentMethod).optional(),
  bankAccountId: z.string().cuid().optional().nullable(),
});

@Injectable()
export class PurchaseReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberSeries: NumberSeriesService,
    private readonly inventory: InventoryService,
    private readonly accounting: AccountingService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const where: Prisma.PurchaseReturnWhereInput = {};
    if (query.purchaseInvoiceId) where.purchaseInvoiceId = String(query.purchaseInvoiceId);

    const [rows, total] = await Promise.all([
      this.prisma.purchaseReturn.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          purchaseInvoice: { select: { id: true, number: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      this.prisma.purchaseReturn.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const ret = await this.prisma.purchaseReturn.findUnique({
      where: { id },
      include: { purchaseInvoice: true, supplier: true, items: true },
    });
    if (!ret) throw new NotFoundException('Purchase return not found');
    return { ...serializeRecord(ret), items: serializeMany(ret.items) };
  }

  async createFromPurchase(body: unknown, userId?: string) {
    const dto = zodValidate(createPurchaseReturnSchema, body);

    const purchase = await this.prisma.purchaseInvoice.findFirst({
      where: { id: dto.purchaseInvoiceId, deletedAt: null, status: DocumentStatus.POSTED },
    });
    if (!purchase) throw new NotFoundException('Posted purchase invoice not found');

    const computedItems = dto.items.map((item) => {
      const { vat, gross } = calcVat(item.lineNet, item.vatRate ?? '5.000');
      return { ...item, vatAmount: vat, lineTotal: gross };
    });

    const taxable = computedItems.reduce((s, i) => addMoney(s, i.lineNet), '0.000');
    const vatAmount = computedItems.reduce((s, i) => addMoney(s, i.vatAmount), '0.000');
    const total = addMoney(taxable, vatAmount);

    const purchaseReturn = await this.prisma.purchaseReturn.create({
      data: {
        number: `PR-DRAFT-${Date.now()}`,
        purchaseInvoiceId: dto.purchaseInvoiceId,
        supplierId: purchase.supplierId,
        returnDate: dto.returnDate ? new Date(dto.returnDate) : new Date(),
        status: DocumentStatus.DRAFT,
        taxable,
        vatAmount,
        total,
        refundAmount: roundMoney(dto.refundAmount ?? total),
        notes: dto.notes ?? null,
        createdById: userId,
        items: {
          create: computedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            netWeight: item.netWeight,
            lineNet: item.lineNet,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true, purchaseInvoice: true, supplier: true },
    });

    return {
      ...serializeRecord(purchaseReturn),
      items: serializeMany(purchaseReturn.items),
    };
  }

  async post(id: string, body: unknown, userId?: string) {
    const extraSchema = z.object({
      refundMethod: z.nativeEnum(PaymentMethod).optional(),
      bankAccountId: z.string().cuid().optional().nullable(),
      refundAmount: moneySchema.optional(),
    });
    const extra = zodValidate(extraSchema, body ?? {});

    return this.prisma.$transaction(async (tx) => {
      const ret = await tx.purchaseReturn.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!ret) throw new NotFoundException('Purchase return not found');
      if (ret.status !== DocumentStatus.DRAFT) {
        throw new BadRequestException('Return already posted');
      }

      const number = await this.numberSeries.nextNumber('PURCHASE_RETURN', 'PR', tx);
      const refundAmount = roundMoney(extra.refundAmount ?? decimalStr(ret.refundAmount));
      const refundMethod = extra.refundMethod ?? PaymentMethod.CASH;

      for (const item of ret.items) {
        await this.inventory.adjustStock(tx, {
          productId: item.productId,
          type: 'PURCHASE_RETURN',
          qty: decimalStr(item.quantity),
          weight: decimalStr(item.netWeight),
          refType: 'PURCHASE_RETURN',
          refId: id,
          createdById: userId,
        });
      }

      await tx.supplier.update({
        where: { id: ret.supplierId },
        data: { currentBalance: { decrement: decimalStr(ret.total) } },
      });

      const inventoryCredit = decimalStr(ret.taxable);
      const lines: JournalLineInput[] = [
        {
          accountCode: ACCOUNT_CODES.INVENTORY,
          debit: '0.000',
          credit: inventoryCredit,
        },
        {
          accountCode: ACCOUNT_CODES.INPUT_VAT,
          debit: '0.000',
          credit: decimalStr(ret.vatAmount),
        },
      ];

      if (refundMethod === PaymentMethod.CASH) {
        lines.push({
          accountCode: ACCOUNT_CODES.CASH,
          debit: refundAmount,
          credit: '0.000',
        });
      } else {
        lines.push({
          accountCode: ACCOUNT_CODES.BANK,
          debit: refundAmount,
          credit: '0.000',
        });
        if (extra.bankAccountId) {
          await tx.bankAccount.update({
            where: { id: extra.bankAccountId },
            data: { currentBalance: { increment: refundAmount } },
          });
        }
      }

      await this.accounting.postJournal(tx, {
        entryDate: ret.returnDate,
        memo: `Purchase return ${number}`,
        sourceType: 'PURCHASE_RETURN',
        sourceId: id,
        createdById: userId,
        lines,
      });

      const updated = await tx.purchaseReturn.update({
        where: { id },
        data: {
          number,
          status: DocumentStatus.POSTED,
          refundAmount,
          postedAt: new Date(),
        },
        include: { items: true, purchaseInvoice: true, supplier: true },
      });

      return {
        ...serializeRecord(updated),
        items: serializeMany(updated.items),
      };
    });
  }
}
