import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { addMoney, calcVat, roundMoney } from '@jewelry-erp/shared';
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
import { moneySchema } from '@jewelry-erp/shared';

const saleReturnItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  netWeight: moneySchema.default('0.000'),
  lineNet: moneySchema.optional(),
  vatRate: moneySchema.default('5.000'),
});

const createSaleReturnSchema = z.object({
  saleInvoiceId: z.string().cuid(),
  returnDate: z.string().or(z.coerce.date()).optional(),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(saleReturnItemSchema).min(1),
  refundAmount: moneySchema.optional(),
  refundMethod: z.nativeEnum(PaymentMethod).optional(),
  bankAccountId: z.string().cuid().optional().nullable(),
});

@Injectable()
export class SaleReturnsService {
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
    const where: Prisma.SaleReturnWhereInput = {};
    if (query.saleInvoiceId) where.saleInvoiceId = String(query.saleInvoiceId);

    const [rows, total] = await Promise.all([
      this.prisma.saleReturn.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          saleInvoice: { select: { id: true, number: true } },
          customer: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.saleReturn.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const ret = await this.prisma.saleReturn.findUnique({
      where: { id },
      include: {
        saleInvoice: true,
        customer: true,
        items: true,
      },
    });
    if (!ret) throw new NotFoundException('Sale return not found');
    return {
      ...serializeRecord(ret),
      items: serializeMany(ret.items),
    };
  }

  async createFromSale(body: unknown, userId?: string) {
    const dto = zodValidate(createSaleReturnSchema, body);

    const sale = await this.prisma.saleInvoice.findFirst({
      where: { id: dto.saleInvoiceId, deletedAt: null, status: DocumentStatus.POSTED },
      include: { items: true },
    });
    if (!sale) {
      throw new NotFoundException('Posted sale invoice not found');
    }

    const computedItems = dto.items.map((item) => {
      const saleLine = sale.items.find((si) => si.productId === item.productId);
      const net =
        item.lineNet ??
        (saleLine
          ? roundMoney(
              (
                parseFloat(saleLine.lineNet.toString()) *
                (parseFloat(String(item.quantity)) /
                  parseFloat(saleLine.quantity.toString()))
              ).toFixed(3),
            )
          : '0.000');
      const { vat, gross } = calcVat(net, item.vatRate ?? '5.000');
      return {
        ...item,
        lineNet: net,
        vatAmount: vat,
        lineTotal: gross,
      };
    });

    const taxable = computedItems.reduce((s, i) => addMoney(s, i.lineNet), '0.000');
    const vatAmount = computedItems.reduce((s, i) => addMoney(s, i.vatAmount), '0.000');
    const total = addMoney(taxable, vatAmount);

    const saleReturn = await this.prisma.saleReturn.create({
      data: {
        number: `SR-DRAFT-${Date.now()}`,
        saleInvoiceId: dto.saleInvoiceId,
        customerId: sale.customerId,
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
      include: { items: true, saleInvoice: true, customer: true },
    });

    return {
      ...serializeRecord(saleReturn),
      items: serializeMany(saleReturn.items),
    };
  }

  async post(id: string, body: unknown, userId?: string) {
    const refundSchema = z.object({
      refundMethod: z.nativeEnum(PaymentMethod).optional(),
      bankAccountId: z.string().cuid().optional().nullable(),
      refundAmount: moneySchema.optional(),
    });
    const extra = zodValidate(refundSchema, body ?? {});

    return this.prisma.$transaction(async (tx) => {
      const ret = await tx.saleReturn.findUnique({
        where: { id },
        include: { items: true, saleInvoice: true },
      });
      if (!ret) throw new NotFoundException('Sale return not found');
      if (ret.status !== DocumentStatus.DRAFT) {
        throw new BadRequestException('Return already posted');
      }

      const number = await this.numberSeries.nextNumber('SALE_RETURN', 'SR', tx);
      const refundAmount = roundMoney(extra.refundAmount ?? decimalStr(ret.refundAmount));
      const refundMethod = extra.refundMethod ?? PaymentMethod.CASH;

      for (const item of ret.items) {
        await this.inventory.adjustStock(tx, {
          productId: item.productId,
          type: 'SALE_RETURN',
          qty: decimalStr(item.quantity),
          weight: decimalStr(item.netWeight),
          refType: 'SALE_RETURN',
          refId: id,
          createdById: userId,
        });
      }

      if (ret.customerId) {
        await tx.customer.update({
          where: { id: ret.customerId },
          data: { currentBalance: { decrement: decimalStr(ret.total) } },
        });
      }

      const lines: JournalLineInput[] = [
        {
          accountCode: ACCOUNT_CODES.SALES,
          debit: decimalStr(ret.taxable),
          credit: '0.000',
        },
        {
          accountCode: ACCOUNT_CODES.OUTPUT_VAT,
          debit: decimalStr(ret.vatAmount),
          credit: '0.000',
        },
      ];

      if (refundMethod === PaymentMethod.CASH) {
        lines.push({
          accountCode: ACCOUNT_CODES.CASH,
          debit: '0.000',
          credit: refundAmount,
        });
      } else {
        lines.push({
          accountCode: ACCOUNT_CODES.BANK,
          debit: '0.000',
          credit: refundAmount,
        });
        if (extra.bankAccountId) {
          await tx.bankAccount.update({
            where: { id: extra.bankAccountId },
            data: { currentBalance: { decrement: refundAmount } },
          });
        }
      }

      await this.accounting.postJournal(tx, {
        entryDate: ret.returnDate,
        memo: `Sale return ${number}`,
        sourceType: 'SALE_RETURN',
        sourceId: id,
        createdById: userId,
        lines,
      });

      const updated = await tx.saleReturn.update({
        where: { id },
        data: {
          number,
          status: DocumentStatus.POSTED,
          refundAmount,
          postedAt: new Date(),
        },
        include: { items: true, saleInvoice: true, customer: true },
      });

      return {
        ...serializeRecord(updated),
        items: serializeMany(updated.items),
      };
    });
  }
}
