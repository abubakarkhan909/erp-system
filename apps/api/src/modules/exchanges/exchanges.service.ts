import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GoldKarat, PartyType, Prisma, ProductType, StockMovementType } from '@prisma/client';
import { moneySchema } from '@jewelry-erp/shared';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
import { postJournalEntry } from '../../common/utils/journal.helper';
import { decimalStr, paginatedResult, parsePagination } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';

const createExchangeSchema = z.object({
  customerId: z.string().cuid().optional().nullable(),
  saleInvoiceId: z.string().cuid().optional().nullable(),
  exchangeDate: z.string().or(z.coerce.date()).optional(),
  karat: z.nativeEnum(GoldKarat),
  weight: moneySchema,
  ratePerGram: moneySchema,
  paymentOut: moneySchema.default('0.000'),
  notes: z.string().max(2000).optional().nullable(),
});

const postExchangeSchema = z.object({
  scrapProductId: z.string().cuid().optional().nullable(),
});

@Injectable()
export class ExchangesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberSeries: NumberSeriesService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const where: Prisma.OldGoldExchangeWhereInput = {};
    if (query.status) where.status = query.status as Prisma.EnumDocumentStatusFilter['equals'];
    if (query.customerId) where.customerId = query.customerId as string;

    const [rows, total] = await Promise.all([
      this.prisma.oldGoldExchange.findMany({
        where,
        skip,
        take,
        include: {
          customer: { select: { id: true, name: true } },
          saleInvoice: { select: { id: true, number: true, balance: true } },
        },
        orderBy: { createdAt: sortDir as Prisma.SortOrder },
      }),
      this.prisma.oldGoldExchange.count({ where }),
    ]);

    return paginatedResult(rows.map((r) => this.formatExchange(r)), total, page, pageSize);
  }

  async findOne(id: string) {
    const row = await this.prisma.oldGoldExchange.findUnique({
      where: { id },
      include: {
        customer: true,
        saleInvoice: { select: { id: true, number: true, total: true, balance: true, paid: true } },
      },
    });
    if (!row) throw new NotFoundException('Old gold exchange not found');
    return this.formatExchange(row);
  }

  async create(body: unknown, userId?: string) {
    const dto = zodValidate(createExchangeSchema, body);
    const weight = new Prisma.Decimal(dto.weight);
    const rate = new Prisma.Decimal(dto.ratePerGram);
    const value = weight.mul(rate).toDecimalPlaces(3);
    const number = await this.numberSeries.nextNumber('EXCHANGE', 'EX');

    const row = await this.prisma.oldGoldExchange.create({
      data: {
        number,
        customerId: dto.customerId ?? null,
        saleInvoiceId: dto.saleInvoiceId ?? null,
        exchangeDate: dto.exchangeDate ? new Date(dto.exchangeDate) : new Date(),
        karat: dto.karat,
        weight,
        ratePerGram: rate,
        value,
        paymentOut: dto.paymentOut,
        status: 'DRAFT',
        notes: dto.notes ?? null,
        createdById: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        saleInvoice: { select: { id: true, number: true } },
      },
    });

    return this.formatExchange(row);
  }

  async post(id: string, body: unknown, userId?: string) {
    const { scrapProductId } = zodValidate(postExchangeSchema, body ?? {});
    const exchange = await this.prisma.oldGoldExchange.findUnique({ where: { id } });
    if (!exchange) throw new NotFoundException('Old gold exchange not found');
    if (exchange.status !== 'DRAFT') {
      throw new BadRequestException('Only draft exchanges can be posted');
    }

    const value = exchange.value;
    const creditToSale = exchange.saleInvoiceId
      ? Prisma.Decimal.min(value, await this.getInvoiceBalance(exchange.saleInvoiceId))
      : new Prisma.Decimal(0);
    const cashOut = exchange.paymentOut.greaterThan(0)
      ? exchange.paymentOut
      : value.sub(creditToSale);

    const scrapProduct = await this.findScrapProduct(scrapProductId);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (scrapProduct) {
        await this.increaseScrapInventory(tx, scrapProduct.id, exchange.weight, exchange.id, userId);
      }

      const journalLines: Parameters<typeof postJournalEntry>[2]['lines'] = [];

      if (scrapProduct) {
        journalLines.push({
          accountCode: '1300',
          debit: value,
          narration: `Old gold exchange ${exchange.number} inventory`,
        });
      } else {
        journalLines.push({
          accountCode: '5100',
          debit: value,
          narration: `Old gold exchange ${exchange.number} expense`,
        });
      }

      if (creditToSale.greaterThan(0) && exchange.saleInvoiceId) {
        journalLines.push({
          accountCode: '1200',
          credit: creditToSale,
          partyType: PartyType.CUSTOMER,
          partyId: exchange.customerId ?? undefined,
          narration: 'Applied to sale invoice',
        });
        await tx.saleInvoice.update({
          where: { id: exchange.saleInvoiceId },
          data: {
            paid: { increment: creditToSale },
            balance: { decrement: creditToSale },
          },
        });
      }

      if (cashOut.greaterThan(0)) {
        journalLines.push({
          accountCode: '1000',
          credit: cashOut,
          narration: 'Cash paid out for old gold',
        });
      }

      await postJournalEntry(
        this.prisma,
        this.numberSeries,
        {
          entryDate: exchange.exchangeDate,
          memo: `Old gold exchange ${exchange.number}`,
          sourceType: 'EXCHANGE',
          sourceId: exchange.id,
          userId,
          lines: journalLines,
        },
        tx,
      );

      return tx.oldGoldExchange.update({
        where: { id },
        data: { status: 'POSTED', postedAt: new Date() },
        include: {
          customer: { select: { id: true, name: true } },
          saleInvoice: { select: { id: true, number: true, balance: true } },
        },
      });
    });

    return this.formatExchange(updated);
  }

  private async getInvoiceBalance(saleInvoiceId: string): Promise<Prisma.Decimal> {
    const inv = await this.prisma.saleInvoice.findUnique({ where: { id: saleInvoiceId } });
    if (!inv) throw new NotFoundException('Linked sale invoice not found');
    return inv.balance;
  }

  private async findScrapProduct(explicitId?: string | null) {
    if (explicitId) {
      const p = await this.prisma.product.findFirst({
        where: { id: explicitId, deletedAt: null, productType: ProductType.RAW_GOLD },
      });
      if (p) return p;
    }
    return this.prisma.product.findFirst({
      where: { deletedAt: null, productType: ProductType.RAW_GOLD, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async increaseScrapInventory(
    tx: Prisma.TransactionClient,
    productId: string,
    weight: Prisma.Decimal,
    refId: string,
    userId?: string,
  ) {
    await tx.stockMovement.create({
      data: {
        productId,
        type: StockMovementType.EXCHANGE_IN,
        qty: 0,
        weight,
        refType: 'EXCHANGE',
        refId,
        notes: 'Old gold exchange inbound',
        createdById: userId,
      },
    });

    const balance = await tx.stockBalance.findUnique({ where: { productId } });
    if (balance) {
      await tx.stockBalance.update({
        where: { productId },
        data: { onHandWeight: { increment: weight } },
      });
    } else {
      await tx.stockBalance.create({
        data: { productId, onHandWeight: weight },
      });
    }
  }

  private formatExchange(row: {
    id: string;
    number: string;
    customerId: string | null;
    saleInvoiceId: string | null;
    exchangeDate: Date;
    karat: GoldKarat;
    weight: Prisma.Decimal;
    ratePerGram: Prisma.Decimal;
    value: Prisma.Decimal;
    paymentOut: Prisma.Decimal;
    status: string;
    notes: string | null;
    postedAt: Date | null;
    createdAt: Date;
    customer?: { id: string; name: string } | null;
    saleInvoice?: { id: string; number: string; balance?: Prisma.Decimal } | null;
  }) {
    return {
      id: row.id,
      number: row.number,
      customerId: row.customerId,
      customer: row.customer,
      saleInvoiceId: row.saleInvoiceId,
      saleInvoice: row.saleInvoice
        ? {
            ...row.saleInvoice,
            balance: row.saleInvoice.balance != null ? decimalStr(row.saleInvoice.balance) : undefined,
          }
        : null,
      exchangeDate: row.exchangeDate.toISOString().slice(0, 10),
      karat: row.karat,
      weight: decimalStr(row.weight),
      ratePerGram: decimalStr(row.ratePerGram),
      value: decimalStr(row.value),
      paymentOut: decimalStr(row.paymentOut),
      status: row.status,
      notes: row.notes,
      postedAt: row.postedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
