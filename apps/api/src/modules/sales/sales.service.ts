import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentStatus, PaymentMethod, Prisma } from '@prisma/client';
import {
  addMoney,
  calcGoldLine,
  roundMoney,
  saleInvoiceSchema,
  subMoney,
} from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
import { InventoryService } from '../inventory/inventory.service';
import { AccountingService } from '../accounting/accounting.service';
import { ACCOUNT_CODES } from '../accounting/accounting.constants';
import { decimalStr } from '../../common/utils/pagination';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { serializeMany, serializeRecord } from '../../common/utils/serialize';
import { zodValidate } from '../../common/utils/zod-validate';
import { z } from 'zod';

const updateSaleSchema = saleInvoiceSchema.partial().extend({
  items: saleInvoiceSchema.shape.items.optional(),
});

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberSeries: NumberSeriesService,
    private readonly inventory: InventoryService,
    private readonly accounting: AccountingService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortBy, sortDir } =
      parsePagination(query as Parameters<typeof parsePagination>[0]);

    const where: Prisma.SaleInvoiceWhereInput = { deletedAt: null };
    if (query.status) where.status = query.status as DocumentStatus;
    if (query.customerId) where.customerId = String(query.customerId);
    if (search) {
      where.OR = [{ number: { contains: search } }, { notes: { contains: search } }];
    }

    const orderBy: Prisma.SaleInvoiceOrderByWithRelationInput = {};
    const allowed = ['invoiceDate', 'number', 'total', 'createdAt'] as const;
    const field = allowed.includes(sortBy as (typeof allowed)[number])
      ? (sortBy as (typeof allowed)[number])
      : 'createdAt';
    orderBy[field] = sortDir as Prisma.SortOrder;

    const [rows, total] = await Promise.all([
      this.prisma.saleInvoice.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.saleInvoice.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const invoice = await this.prisma.saleInvoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, sku: true, name: true } } } },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Sale invoice not found');
    return this.serializeInvoice(invoice);
  }

  async createDraft(body: unknown, userId?: string) {
    const dto = zodValidate(saleInvoiceSchema, body);
    const totals = this.calcInvoiceTotals(dto.items, dto.discount ?? '0.000');

    const invoice = await this.prisma.saleInvoice.create({
      data: {
        number: `DRAFT-${Date.now()}`,
        customerId: dto.customerId ?? null,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
        status: DocumentStatus.DRAFT,
        subtotal: totals.subtotal,
        discount: dto.discount ?? '0.000',
        taxable: totals.taxable,
        vatAmount: totals.vatAmount,
        total: totals.total,
        paid: '0.000',
        balance: totals.total,
        notes: dto.notes ?? null,
        createdById: userId,
        updatedById: userId,
        items: {
          create: totals.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            grossWeight: item.grossWeight,
            netWeight: item.netWeight,
            stoneWeight: item.stoneWeight,
            karat: item.karat ?? null,
            goldRateSnapshot: item.goldRateSnapshot,
            unitPrice: item.unitPrice,
            makingCharges: item.makingCharges,
            stoneCharges: item.stoneCharges,
            lineDiscount: item.lineDiscount,
            lineNet: item.lineNet,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    return this.serializeInvoice(invoice);
  }

  async updateDraft(id: string, body: unknown, userId?: string) {
    const existing = await this.prisma.saleInvoice.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Sale invoice not found');
    if (existing.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    const dto = zodValidate(updateSaleSchema, body);
    const items = dto.items ?? [];
    const discount = dto.discount ?? decimalStr(existing.discount);
    const totals = dto.items
      ? this.calcInvoiceTotals(items, discount)
      : {
          subtotal: decimalStr(existing.subtotal),
          taxable: decimalStr(existing.taxable),
          vatAmount: decimalStr(existing.vatAmount),
          total: decimalStr(existing.total),
          items: [],
        };

    const invoice = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.saleInvoiceItem.deleteMany({ where: { saleInvoiceId: id } });
      }

      return tx.saleInvoice.update({
        where: { id },
        data: {
          customerId: dto.customerId !== undefined ? dto.customerId : undefined,
          invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
          discount,
          subtotal: totals.subtotal,
          taxable: totals.taxable,
          vatAmount: totals.vatAmount,
          total: totals.total,
          balance: totals.total,
          notes: dto.notes !== undefined ? dto.notes : undefined,
          updatedById: userId,
          ...(dto.items
            ? {
                items: {
                  create: totals.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    grossWeight: item.grossWeight,
                    netWeight: item.netWeight,
                    stoneWeight: item.stoneWeight,
                    karat: item.karat ?? null,
                    goldRateSnapshot: item.goldRateSnapshot,
                    unitPrice: item.unitPrice,
                    makingCharges: item.makingCharges,
                    stoneCharges: item.stoneCharges,
                    lineDiscount: item.lineDiscount,
                    lineNet: item.lineNet,
                    vatRate: item.vatRate,
                    vatAmount: item.vatAmount,
                    lineTotal: item.lineTotal,
                  })),
                },
              }
            : {}),
        },
        include: {
          items: { include: { product: { select: { id: true, sku: true, name: true } } } },
          customer: true,
          payments: true,
        },
      });
    });

    return this.serializeInvoice(invoice);
  }

  async post(id: string, body: unknown, userId?: string) {
    const paymentsSchema = z.object({
      payments: z
        .array(
          z.object({
            method: z.nativeEnum(PaymentMethod),
            amount: z.string(),
            bankAccountId: z.string().optional().nullable(),
            reference: z.string().optional().nullable(),
            chequeNo: z.string().optional().nullable(),
            chequeBankName: z.string().optional().nullable(),
            chequeDueDate: z.string().optional().nullable(),
            idempotencyKey: z.string().optional().nullable(),
          }),
        )
        .optional(),
    });

    const { payments: paymentRows } = zodValidate(paymentsSchema, body ?? {});

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.saleInvoice.findFirst({
        where: { id, deletedAt: null },
        include: { items: { include: { product: true } } },
      });
      if (!invoice) throw new NotFoundException('Sale invoice not found');
      if (invoice.status !== DocumentStatus.DRAFT) {
        throw new BadRequestException('Invoice already posted or voided');
      }

      const number = await this.numberSeries.nextNumber('SALE', 'INV', tx);
      let paidTotal = '0.000';
      const payments = paymentRows ?? [];

      for (const p of payments) {
        paidTotal = addMoney(paidTotal, p.amount);
        await tx.salePayment.create({
          data: {
            saleInvoiceId: id,
            method: p.method,
            amount: roundMoney(p.amount),
            bankAccountId: p.bankAccountId ?? null,
            reference: p.reference ?? null,
            chequeNo: p.chequeNo ?? null,
            chequeBankName: p.chequeBankName ?? null,
            chequeDueDate: p.chequeDueDate ? new Date(p.chequeDueDate) : null,
            idempotencyKey: p.idempotencyKey ?? null,
            createdById: userId,
          },
        });

        if (p.method === PaymentMethod.CASH) {
          await this.recordCashMovement(tx, p.amount, 'SALE', id, userId);
        }
        if (
          (p.method === PaymentMethod.BANK_TRANSFER ||
            p.method === PaymentMethod.CARD ||
            p.method === PaymentMethod.CHEQUE) &&
          p.bankAccountId
        ) {
          await tx.bankAccount.update({
            where: { id: p.bankAccountId },
            data: { currentBalance: { increment: roundMoney(p.amount) } },
          });
          await tx.bankTransaction.create({
            data: {
              bankAccountId: p.bankAccountId,
              type: 'DEPOSIT',
              amount: roundMoney(p.amount),
              reference: p.reference ?? number,
              memo: `Sale ${number}`,
              txnDate: invoice.invoiceDate,
              createdById: userId,
            },
          });
        }
      }

      const total = decimalStr(invoice.total);
      const balance = roundMoney(subMoney(total, paidTotal));
      if (parseFloat(balance) < -0.001) {
        throw new BadRequestException('Payments exceed invoice total');
      }

      let cogsTotal = '0.000';
      for (const item of invoice.items) {
        await this.inventory.adjustStock(tx, {
          productId: item.productId,
          type: 'SALE',
          qty: decimalStr(item.quantity),
          weight: decimalStr(item.netWeight),
          refType: 'SALE_INVOICE',
          refId: id,
          createdById: userId,
        });

        const unitCost = decimalStr(item.product.purchasePrice);
        const lineCogs = roundMoney(
          (parseFloat(unitCost) * parseFloat(decimalStr(item.quantity))).toFixed(3),
        );
        cogsTotal = addMoney(cogsTotal, lineCogs);
      }

      if (invoice.customerId && parseFloat(balance) > 0) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: { currentBalance: { increment: balance } },
        });
      }

      await this.postSaleJournal(tx, {
        invoiceId: id,
        invoiceNumber: number,
        customerId: invoice.customerId,
        total,
        taxable: decimalStr(invoice.taxable),
        vatAmount: decimalStr(invoice.vatAmount),
        paidTotal,
        balance,
        payments,
        cogsTotal,
        entryDate: invoice.invoiceDate,
        userId,
      });

      const updated = await tx.saleInvoice.update({
        where: { id },
        data: {
          number,
          status: DocumentStatus.POSTED,
          paid: paidTotal,
          balance,
          postedAt: new Date(),
          updatedById: userId,
        },
        include: {
          items: { include: { product: { select: { id: true, sku: true, name: true } } } },
          customer: true,
          payments: true,
        },
      });

      return this.serializeInvoice(updated);
    });
  }

  async voidPosted(id: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.saleInvoice.findFirst({
        where: { id, deletedAt: null },
        include: { items: true, payments: true },
      });
      if (!invoice) throw new NotFoundException('Sale invoice not found');
      if (invoice.status !== DocumentStatus.POSTED) {
        throw new BadRequestException('Only posted invoices can be voided');
      }

      for (const item of invoice.items) {
        await this.inventory.adjustStock(tx, {
          productId: item.productId,
          type: 'SALE_RETURN',
          qty: decimalStr(item.quantity),
          weight: decimalStr(item.netWeight),
          refType: 'SALE_VOID',
          refId: id,
          createdById: userId,
        });
      }

      const balance = decimalStr(invoice.balance);
      if (invoice.customerId && parseFloat(balance) > 0) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: { currentBalance: { decrement: balance } },
        });
      }

      for (const p of invoice.payments) {
        if (p.method === PaymentMethod.CASH) {
          await this.recordCashMovement(
            tx,
            roundMoney(`-${decimalStr(p.amount)}`),
            'SALE_VOID',
            id,
            userId,
          );
        }
        if (p.bankAccountId) {
          await tx.bankAccount.update({
            where: { id: p.bankAccountId },
            data: { currentBalance: { decrement: decimalStr(p.amount) } },
          });
        }
      }

      await this.accounting.reverseJournalBySource(tx, 'SALE_INVOICE', id, userId);

      const updated = await tx.saleInvoice.update({
        where: { id },
        data: {
          status: DocumentStatus.VOID,
          voidedAt: new Date(),
          updatedById: userId,
        },
        include: {
          items: { include: { product: { select: { id: true, sku: true, name: true } } } },
          customer: true,
          payments: true,
        },
      });

      return this.serializeInvoice(updated);
    });
  }

  private calcInvoiceTotals(
    items: Array<{
      productId: string;
      quantity: number;
      grossWeight?: string;
      netWeight?: string;
      stoneWeight?: string;
      karat?: z.infer<typeof saleInvoiceSchema>['items'][number]['karat'];
      goldRateSnapshot?: string;
      unitPrice?: string;
      makingCharges?: string;
      stoneCharges?: string;
      lineDiscount?: string;
      vatRate?: string;
    }>,
    headerDiscount: string,
  ) {
    const computed = items.map((item) => {
      const calc = calcGoldLine({
        netWeightGram: item.netWeight ?? '0.000',
        ratePerGram: item.goldRateSnapshot || item.unitPrice || '0.000',
        makingCharges: item.makingCharges ?? '0.000',
        stoneCharges: item.stoneCharges ?? '0.000',
        lineDiscount: item.lineDiscount ?? '0.000',
        vatRatePercent: item.vatRate ?? '5.000',
      });
      return {
        ...item,
        grossWeight: item.grossWeight ?? '0.000',
        netWeight: item.netWeight ?? '0.000',
        stoneWeight: item.stoneWeight ?? '0.000',
        goldRateSnapshot: item.goldRateSnapshot ?? '0.000',
        unitPrice: item.unitPrice ?? '0.000',
        makingCharges: item.makingCharges ?? '0.000',
        stoneCharges: item.stoneCharges ?? '0.000',
        lineDiscount: item.lineDiscount ?? '0.000',
        vatRate: item.vatRate ?? '5.000',
        lineNet: calc.lineNet,
        vatAmount: calc.vatAmount,
        lineTotal: calc.lineTotal,
      };
    });

    const subtotal = computed.reduce((s, i) => addMoney(s, i.lineNet), '0.000');
    const vatBeforeDiscount = computed.reduce((s, i) => addMoney(s, i.vatAmount), '0.000');
    const grossBeforeDiscount = computed.reduce((s, i) => addMoney(s, i.lineTotal), '0.000');
    const discount = roundMoney(headerDiscount);
    const taxable = roundMoney(subMoney(subtotal, discount));
    const vatAmount =
      parseFloat(subtotal) > 0
        ? roundMoney(
            (
              (parseFloat(vatBeforeDiscount) * parseFloat(taxable)) /
              parseFloat(subtotal)
            ).toFixed(3),
          )
        : '0.000';
    const total = addMoney(taxable, vatAmount);

    return {
      items: computed,
      subtotal: roundMoney(subtotal),
      taxable,
      vatAmount,
      total,
      grossBeforeDiscount,
    };
  }

  private async postSaleJournal(
    tx: Prisma.TransactionClient,
    ctx: {
      invoiceId: string;
      invoiceNumber: string;
      customerId: string | null;
      total: string;
      taxable: string;
      vatAmount: string;
      paidTotal: string;
      balance: string;
      payments: Array<{ method: PaymentMethod; amount: string; bankAccountId?: string | null }>;
      cogsTotal: string;
      entryDate: Date;
      userId?: string;
    },
  ) {
    const lines: Parameters<AccountingService['postJournal']>[1]['lines'] = [];

    let cashTotal = '0.000';
    let bankTotal = '0.000';
    for (const p of ctx.payments) {
      if (p.method === PaymentMethod.CASH) {
        cashTotal = addMoney(cashTotal, p.amount);
      } else if (p.method !== PaymentMethod.MIXED) {
        bankTotal = addMoney(bankTotal, p.amount);
      }
    }

    if (parseFloat(cashTotal) > 0) {
      lines.push({
        accountCode: ACCOUNT_CODES.CASH,
        debit: cashTotal,
        credit: '0.000',
      });
    }
    if (parseFloat(bankTotal) > 0) {
      lines.push({
        accountCode: ACCOUNT_CODES.BANK,
        debit: bankTotal,
        credit: '0.000',
      });
    }
    if (parseFloat(ctx.balance) > 0 && ctx.customerId) {
      lines.push({
        accountCode: ACCOUNT_CODES.AR,
        debit: ctx.balance,
        credit: '0.000',
        partyType: 'CUSTOMER',
        partyId: ctx.customerId,
      });
    }

    lines.push({
      accountCode: ACCOUNT_CODES.SALES,
      debit: '0.000',
      credit: ctx.taxable,
    });
    if (parseFloat(ctx.vatAmount) > 0) {
      lines.push({
        accountCode: ACCOUNT_CODES.OUTPUT_VAT,
        debit: '0.000',
        credit: ctx.vatAmount,
      });
    }

    if (parseFloat(ctx.cogsTotal) > 0) {
      lines.push({
        accountCode: ACCOUNT_CODES.COGS,
        debit: ctx.cogsTotal,
        credit: '0.000',
      });
      lines.push({
        accountCode: ACCOUNT_CODES.INVENTORY,
        debit: '0.000',
        credit: ctx.cogsTotal,
      });
    }

    await this.accounting.postJournal(tx, {
      entryDate: ctx.entryDate,
      memo: `Sale invoice ${ctx.invoiceNumber}`,
      sourceType: 'SALE_INVOICE',
      sourceId: ctx.invoiceId,
      createdById: ctx.userId,
      lines,
    });
  }

  private async recordCashMovement(
    tx: Prisma.TransactionClient,
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
        type: parseFloat(amount) >= 0 ? 'IN' : 'OUT',
        amount: roundMoney(Math.abs(parseFloat(amount)).toFixed(3)),
        reason: refType,
        refType,
        refId,
        createdById: userId,
      },
    });
  }

  private serializeInvoice(invoice: Record<string, unknown>) {
    const base = serializeRecord(invoice as Record<string, unknown>);
    if (Array.isArray(invoice.items)) {
      (base as Record<string, unknown>).items = serializeMany(
        invoice.items as Record<string, unknown>[],
      );
    }
    if (Array.isArray(invoice.payments)) {
      (base as Record<string, unknown>).payments = serializeMany(
        invoice.payments as Record<string, unknown>[],
      );
    }
    return base;
  }
}
