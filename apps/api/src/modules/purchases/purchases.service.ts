import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentStatus, GoldKarat, PaymentMethod, Prisma } from '@prisma/client';
import {
  addMoney,
  calcVat,
  moneySchema,
  paymentRowSchema,
  roundMoney,
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

const purchaseItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  grossWeight: moneySchema.default('0.000'),
  netWeight: moneySchema.default('0.000'),
  karat: z.nativeEnum(GoldKarat).optional().nullable(),
  unitCost: moneySchema.default('0.000'),
  lineDiscount: moneySchema.default('0.000'),
  vatRate: moneySchema.default('5.000'),
});

const purchaseInvoiceSchema = z.object({
  supplierId: z.string().cuid(),
  invoiceDate: z.string().or(z.coerce.date()).optional(),
  discount: moneySchema.default('0.000'),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(purchaseItemSchema).min(1),
  payments: z.array(paymentRowSchema).optional(),
});

const updatePurchaseSchema = purchaseInvoiceSchema.partial().extend({
  items: purchaseInvoiceSchema.shape.items.optional(),
});

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberSeries: NumberSeriesService,
    private readonly inventory: InventoryService,
    private readonly accounting: AccountingService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortBy, sortDir } =
      parsePagination(query as Parameters<typeof parsePagination>[0]);

    const where: Prisma.PurchaseInvoiceWhereInput = { deletedAt: null };
    if (query.status) where.status = query.status as DocumentStatus;
    if (query.supplierId) where.supplierId = String(query.supplierId);
    if (search) {
      where.OR = [{ number: { contains: search } }, { notes: { contains: search } }];
    }

    const orderBy: Prisma.PurchaseInvoiceOrderByWithRelationInput = {};
    const allowed = ['invoiceDate', 'number', 'total', 'createdAt'] as const;
    const field = allowed.includes(sortBy as (typeof allowed)[number])
      ? (sortBy as (typeof allowed)[number])
      : 'createdAt';
    orderBy[field] = sortDir as Prisma.SortOrder;

    const [rows, total] = await Promise.all([
      this.prisma.purchaseInvoice.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          supplier: { select: { id: true, name: true, phone: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.purchaseInvoice.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async findOne(id: string) {
    const invoice = await this.prisma.purchaseInvoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        supplier: true,
        items: { include: { product: { select: { id: true, sku: true, name: true } } } },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Purchase invoice not found');
    return this.serializeInvoice(invoice);
  }

  async createDraft(body: unknown, userId?: string) {
    const dto = zodValidate(purchaseInvoiceSchema, body);
    const totals = this.calcInvoiceTotals(dto.items, dto.discount ?? '0.000');

    const invoice = await this.prisma.purchaseInvoice.create({
      data: {
        number: `P-DRAFT-${Date.now()}`,
        supplierId: dto.supplierId,
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
            karat: item.karat ?? null,
            unitCost: item.unitCost,
            lineDiscount: item.lineDiscount,
            lineNet: item.lineNet,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true, supplier: true },
    });

    return this.serializeInvoice(invoice);
  }

  async updateDraft(id: string, body: unknown, userId?: string) {
    const existing = await this.prisma.purchaseInvoice.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Purchase invoice not found');
    if (existing.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    const dto = zodValidate(updatePurchaseSchema, body);
    const discount = dto.discount ?? decimalStr(existing.discount);
    const totals = dto.items
      ? this.calcInvoiceTotals(dto.items, discount)
      : {
          subtotal: decimalStr(existing.subtotal),
          taxable: decimalStr(existing.taxable),
          vatAmount: decimalStr(existing.vatAmount),
          total: decimalStr(existing.total),
          items: [],
        };

    const invoice = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.purchaseInvoiceItem.deleteMany({ where: { purchaseInvoiceId: id } });
      }

      return tx.purchaseInvoice.update({
        where: { id },
        data: {
          supplierId: dto.supplierId,
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
                    karat: item.karat ?? null,
                    unitCost: item.unitCost,
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
          supplier: true,
          payments: true,
        },
      });
    });

    return this.serializeInvoice(invoice);
  }

  async post(id: string, body: unknown, userId?: string) {
    const paymentsSchema = z.object({
      payments: z.array(paymentRowSchema).optional(),
    });
    const { payments: paymentRows } = zodValidate(paymentsSchema, body ?? {});

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.purchaseInvoice.findFirst({
        where: { id, deletedAt: null },
        include: { items: true },
      });
      if (!invoice) throw new NotFoundException('Purchase invoice not found');
      if (invoice.status !== DocumentStatus.DRAFT) {
        throw new BadRequestException('Invoice already posted or voided');
      }

      const number = await this.numberSeries.nextNumber('PURCHASE', 'PI', tx);
      let paidTotal = '0.000';
      const payments = paymentRows ?? [];

      for (const p of payments) {
        paidTotal = addMoney(paidTotal, p.amount);
        await tx.purchasePayment.create({
          data: {
            purchaseInvoiceId: id,
            method: p.method,
            amount: roundMoney(p.amount),
            bankAccountId: p.bankAccountId ?? null,
            reference: p.reference ?? null,
            chequeNo: p.chequeNo ?? null,
            idempotencyKey: p.idempotencyKey ?? null,
            createdById: userId,
          },
        });

        if (p.method === PaymentMethod.CASH) {
          await this.recordCashOut(tx, p.amount, 'PURCHASE', id, userId);
        }
        if (p.bankAccountId) {
          await tx.bankAccount.update({
            where: { id: p.bankAccountId },
            data: { currentBalance: { decrement: roundMoney(p.amount) } },
          });
          await tx.bankTransaction.create({
            data: {
              bankAccountId: p.bankAccountId,
              type: 'WITHDRAW',
              amount: roundMoney(p.amount),
              reference: p.reference ?? number,
              memo: `Purchase ${number}`,
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

      let inventoryTotal = '0.000';
      for (const item of invoice.items) {
        await this.inventory.adjustStock(tx, {
          productId: item.productId,
          type: 'PURCHASE',
          qty: decimalStr(item.quantity),
          weight: decimalStr(item.netWeight),
          refType: 'PURCHASE_INVOICE',
          refId: id,
          createdById: userId,
        });
        inventoryTotal = addMoney(inventoryTotal, decimalStr(item.lineNet));
      }

      await tx.supplier.update({
        where: { id: invoice.supplierId },
        data: {
          currentBalance: { increment: balance },
        },
      });

      await this.postPurchaseJournal(tx, {
        invoiceId: id,
        invoiceNumber: number,
        supplierId: invoice.supplierId,
        total,
        taxable: decimalStr(invoice.taxable),
        vatAmount: decimalStr(invoice.vatAmount),
        inventoryTotal,
        paidTotal,
        balance,
        payments,
        entryDate: invoice.invoiceDate,
        userId,
      });

      const updated = await tx.purchaseInvoice.update({
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
          supplier: true,
          payments: true,
        },
      });

      return this.serializeInvoice(updated);
    });
  }

  async voidPosted(id: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.purchaseInvoice.findFirst({
        where: { id, deletedAt: null },
        include: { items: true, payments: true },
      });
      if (!invoice) throw new NotFoundException('Purchase invoice not found');
      if (invoice.status !== DocumentStatus.POSTED) {
        throw new BadRequestException('Only posted invoices can be voided');
      }

      for (const item of invoice.items) {
        await this.inventory.adjustStock(tx, {
          productId: item.productId,
          type: 'PURCHASE_RETURN',
          qty: decimalStr(item.quantity),
          weight: decimalStr(item.netWeight),
          refType: 'PURCHASE_VOID',
          refId: id,
          createdById: userId,
        });
      }

      const balance = decimalStr(invoice.balance);
      await tx.supplier.update({
        where: { id: invoice.supplierId },
        data: { currentBalance: { decrement: balance } },
      });

      for (const p of invoice.payments) {
        if (p.method === PaymentMethod.CASH) {
          await this.recordCashIn(tx, decimalStr(p.amount), 'PURCHASE_VOID', id, userId);
        }
        if (p.bankAccountId) {
          await tx.bankAccount.update({
            where: { id: p.bankAccountId },
            data: { currentBalance: { increment: decimalStr(p.amount) } },
          });
        }
      }

      await this.accounting.reverseJournalBySource(tx, 'PURCHASE_INVOICE', id, userId);

      const updated = await tx.purchaseInvoice.update({
        where: { id },
        data: {
          status: DocumentStatus.VOID,
          voidedAt: new Date(),
          updatedById: userId,
        },
        include: {
          items: { include: { product: { select: { id: true, sku: true, name: true } } } },
          supplier: true,
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
      karat?: z.infer<typeof purchaseItemSchema>['karat'];
      unitCost?: string;
      lineDiscount?: string;
      vatRate?: string;
    }>,
    headerDiscount: string,
  ) {
    const computed = items.map((item) => {
      const unitCost = item.unitCost ?? '0.000';
      const lineDiscount = item.lineDiscount ?? '0.000';
      const vatRate = item.vatRate ?? '5.000';
      const grossLine = roundMoney(
        (parseFloat(unitCost) * parseFloat(String(item.quantity))).toFixed(3),
      );
      const lineNet = roundMoney(subMoney(grossLine, lineDiscount));
      const { vat, gross } = calcVat(lineNet, vatRate);
      return {
        ...item,
        grossWeight: item.grossWeight ?? '0.000',
        netWeight: item.netWeight ?? '0.000',
        unitCost,
        lineDiscount,
        vatRate,
        lineNet,
        vatAmount: vat,
        lineTotal: gross,
      };
    });

    const subtotal = computed.reduce((s, i) => addMoney(s, i.lineNet), '0.000');
    const vatBeforeDiscount = computed.reduce((s, i) => addMoney(s, i.vatAmount), '0.000');
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

    return { items: computed, subtotal: roundMoney(subtotal), taxable, vatAmount, total };
  }

  private async postPurchaseJournal(
    tx: Prisma.TransactionClient,
    ctx: {
      invoiceId: string;
      invoiceNumber: string;
      supplierId: string;
      total: string;
      taxable: string;
      vatAmount: string;
      inventoryTotal: string;
      paidTotal: string;
      balance: string;
      payments: Array<{ method: PaymentMethod; amount: string; bankAccountId?: string | null }>;
      entryDate: Date;
      userId?: string;
    },
  ) {
    const lines: Parameters<AccountingService['postJournal']>[1]['lines'] = [
      {
        accountCode: ACCOUNT_CODES.INVENTORY,
        debit: ctx.inventoryTotal,
        credit: '0.000',
      },
    ];

    if (parseFloat(ctx.vatAmount) > 0) {
      lines.push({
        accountCode: ACCOUNT_CODES.INPUT_VAT,
        debit: ctx.vatAmount,
        credit: '0.000',
      });
    }

    let cashTotal = '0.000';
    let bankTotal = '0.000';
    for (const p of ctx.payments) {
      if (p.method === PaymentMethod.CASH) cashTotal = addMoney(cashTotal, p.amount);
      else bankTotal = addMoney(bankTotal, p.amount);
    }

    if (parseFloat(cashTotal) > 0) {
      lines.push({ accountCode: ACCOUNT_CODES.CASH, debit: '0.000', credit: cashTotal });
    }
    if (parseFloat(bankTotal) > 0) {
      lines.push({ accountCode: ACCOUNT_CODES.BANK, debit: '0.000', credit: bankTotal });
    }
    if (parseFloat(ctx.balance) > 0) {
      lines.push({
        accountCode: ACCOUNT_CODES.AP,
        debit: '0.000',
        credit: ctx.balance,
        partyType: 'SUPPLIER',
        partyId: ctx.supplierId,
      });
    }

    await this.accounting.postJournal(tx, {
      entryDate: ctx.entryDate,
      memo: `Purchase invoice ${ctx.invoiceNumber}`,
      sourceType: 'PURCHASE_INVOICE',
      sourceId: ctx.invoiceId,
      createdById: ctx.userId,
      lines,
    });
  }

  private async recordCashOut(
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
        type: 'OUT',
        amount: roundMoney(amount),
        reason: refType,
        refType,
        refId,
        createdById: userId,
      },
    });
  }

  private async recordCashIn(
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
        type: 'IN',
        amount: roundMoney(amount),
        reason: refType,
        refType,
        refId,
        createdById: userId,
      },
    });
  }

  private serializeInvoice(invoice: Record<string, unknown>) {
    const base = serializeRecord(invoice);
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
