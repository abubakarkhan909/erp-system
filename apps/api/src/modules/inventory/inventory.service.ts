import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import { moneySchema, roundMoney } from '@jewelry-erp/shared';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr } from '../../common/utils/pagination';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
import { serializeMany, serializeRecord } from '../../common/utils/serialize';
import { zodValidate } from '../../common/utils/zod-validate';

export type AdjustStockInput = {
  productId: string;
  type: StockMovementType;
  qty: string;
  weight: string;
  refType?: string;
  refId?: string;
  notes?: string;
  createdById?: string;
};

const OUTBOUND_TYPES: StockMovementType[] = [
  'SALE',
  'PURCHASE_RETURN',
  'DAMAGE',
  'RESERVE',
];

const ownStockSchema = z.object({
  productId: z.string().cuid(),
  qty: z.coerce.number().positive('Quantity must be greater than 0'),
  weight: moneySchema.optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async adjustStock(tx: Prisma.TransactionClient, input: AdjustStockInput) {
    const product = await tx.product.findFirst({
      where: { id: input.productId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const absQty = roundMoney(Math.abs(parseFloat(input.qty || '0')).toFixed(3));
    const absWeight = roundMoney(Math.abs(parseFloat(input.weight || '0')).toFixed(3));

    let qtyDelta = absQty;
    let weightDelta = absWeight;
    let reservedQtyDelta = '0.000';
    let reservedWeightDelta = '0.000';

    if (input.type === 'ADJUSTMENT') {
      qtyDelta = roundMoney(input.qty);
      weightDelta = roundMoney(input.weight);
    } else if (input.type === 'RESERVE') {
      qtyDelta = roundMoney(`-${absQty}`);
      weightDelta = roundMoney(`-${absWeight}`);
      reservedQtyDelta = absQty;
      reservedWeightDelta = absWeight;
    } else if (input.type === 'RELEASE') {
      qtyDelta = absQty;
      weightDelta = absWeight;
      reservedQtyDelta = roundMoney(`-${absQty}`);
      reservedWeightDelta = roundMoney(`-${absWeight}`);
    } else if (OUTBOUND_TYPES.includes(input.type)) {
      qtyDelta = roundMoney(`-${absQty}`);
      weightDelta = roundMoney(`-${absWeight}`);
    }

    await tx.stockBalance.upsert({
      where: { productId: input.productId },
      create: {
        productId: input.productId,
        onHandQty: qtyDelta,
        onHandWeight: weightDelta,
        reservedQty: reservedQtyDelta,
        reservedWeight: reservedWeightDelta,
      },
      update: {
        onHandQty: { increment: qtyDelta },
        onHandWeight: { increment: weightDelta },
        reservedQty: { increment: reservedQtyDelta },
        reservedWeight: { increment: reservedWeightDelta },
      },
    });

    // Re-read after increment so validation uses the new balance
    const fresh = await tx.stockBalance.findUniqueOrThrow({
      where: { productId: input.productId },
    });
    const onHandQty = parseFloat(decimalStr(fresh.onHandQty));
    const onHandWeight = parseFloat(decimalStr(fresh.onHandWeight));
    if (onHandQty < -0.0001 || onHandWeight < -0.0001) {
      throw new BadRequestException('Insufficient stock');
    }

    const movement = await tx.stockMovement.create({
      data: {
        productId: input.productId,
        type: input.type,
        qty: absQty,
        weight: absWeight,
        refType: input.refType ?? null,
        refId: input.refId ?? null,
        notes: input.notes ?? null,
        createdById: input.createdById ?? null,
      },
    });

    return { balance: fresh, movement };
  }

  /**
   * Add own / opening / workshop stock (not purchased from a supplier).
   * Increases on-hand qty and weight; records an ADJUSTMENT with refType OWN_STOCK.
   */
  async addOwnStock(body: unknown, userId?: string) {
    const dto = zodValidate(ownStockSchema, body);

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
      include: { stockBalance: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const qty = roundMoney(String(dto.qty));
    let weight = dto.weight != null && dto.weight !== '' ? roundMoney(dto.weight) : null;

    // Default weight = qty × product net weight (jewelry pcs)
    if (weight == null || parseFloat(weight) <= 0) {
      const unitNet = parseFloat(decimalStr(product.netWeight));
      if (unitNet > 0) {
        weight = roundMoney((unitNet * parseFloat(qty)).toFixed(3));
      } else {
        weight = '0.000';
      }
    }

    const result = await this.prisma.$transaction((tx) =>
      this.adjustStock(tx, {
        productId: dto.productId,
        type: 'ADJUSTMENT',
        qty,
        weight,
        refType: 'OWN_STOCK',
        notes: dto.notes?.trim() || 'Own / opening stock (workshop production)',
        createdById: userId,
      }),
    );

    return {
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name,
      },
      addedQty: qty,
      addedWeight: weight,
      onHandQty: decimalStr(result.balance.onHandQty),
      onHandWeight: decimalStr(result.balance.onHandWeight),
      movementId: result.movement.id,
    };
  }

  async listMovements(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.StockMovementWhereInput = {};
    if (query.productId) where.productId = String(query.productId);
    if (query.refType) where.refType = String(query.refType);
    if (query.refId) where.refId = String(query.refId);
    if (query.type) where.type = query.type as StockMovementType;

    const [rows, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, sku: true, name: true } },
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async getBalances(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.StockBalanceWhereInput = {
      product: { deletedAt: null },
    };
    if (search) {
      where.product = {
        deletedAt: null,
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { barcode: { contains: search } },
        ],
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.stockBalance.findMany({
        where,
        skip,
        take,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              netWeight: true,
              ownership: true,
              minStockQty: true,
              minStockWeight: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.stockBalance.count({ where }),
    ]);

    return paginatedResult(serializeMany(rows), total, page, pageSize);
  }

  async getLowStock() {
    const balances = await this.prisma.stockBalance.findMany({
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            minStockQty: true,
            minStockWeight: true,
            status: true,
          },
        },
      },
    });

    const low = balances.filter((b) => {
      if (b.product.status !== 'ACTIVE') return false;
      const minQty = parseFloat(decimalStr(b.product.minStockQty));
      const minWeight = parseFloat(decimalStr(b.product.minStockWeight));
      const onHandQty = parseFloat(decimalStr(b.onHandQty));
      const onHandWeight = parseFloat(decimalStr(b.onHandWeight));
      return (
        (minQty > 0 && onHandQty <= minQty) ||
        (minWeight > 0 && onHandWeight <= minWeight)
      );
    });

    return serializeMany(low);
  }

  async manualAdjustment(body: AdjustStockInput) {
    return this.prisma.$transaction((tx) => this.adjustStock(tx, body));
  }

  async getBalanceForProduct(productId: string) {
    const balance = await this.prisma.stockBalance.findUnique({
      where: { productId },
      include: { product: { select: { id: true, sku: true, name: true } } },
    });
    if (!balance) {
      return {
        productId,
        onHandQty: '0.000',
        onHandWeight: '0.000',
        reservedQty: '0.000',
        reservedWeight: '0.000',
      };
    }
    return serializeRecord(balance);
  }
}
