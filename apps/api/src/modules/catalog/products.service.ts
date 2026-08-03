import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ProductOwnership,
  productCreateSchema,
  productSchema,
  roundMoney,
} from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr, parsePagination, paginatedResult } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';
import { serializeRecord } from '../../common/utils/serialize';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortBy, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ];
    }
    if (query.ownership === 'OWN' || query.ownership === 'SUPPLIER') {
      where.ownership = query.ownership;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const allowedSort = ['name', 'sku', 'createdAt', 'sellingPrice'] as const;
    const field = allowedSort.includes(sortBy as (typeof allowedSort)[number])
      ? (sortBy as (typeof allowedSort)[number])
      : 'createdAt';
    orderBy[field] = sortDir as Prisma.SortOrder;

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: true,
          brand: true,
          stockBalance: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginatedResult(
      rows.map((p) => this.serializeProduct(p)),
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        brand: true,
        stockBalance: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.serializeProduct(product);
  }

  async create(body: unknown, userId?: string) {
    const dto = zodValidate(productCreateSchema, body);
    const ownership = dto.ownership ?? ProductOwnership.SUPPLIER;

    let openingQty = '0.000';
    let openingWeight = '0.000';

    if (ownership === ProductOwnership.OWN) {
      const qty = Number(dto.openingQty ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new BadRequestException('Opening quantity is required for own products');
      }
      openingQty = roundMoney(String(qty));

      if (dto.openingWeight != null && dto.openingWeight !== '' && parseFloat(dto.openingWeight) > 0) {
        openingWeight = roundMoney(dto.openingWeight);
      } else {
        const unitNet = parseFloat(dto.netWeight ?? '0');
        openingWeight =
          unitNet > 0 ? roundMoney((unitNet * qty).toFixed(3)) : '0.000';
      }
    }

    try {
      const product = await this.prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            sku: dto.sku,
            barcode: dto.barcode ?? null,
            name: dto.name,
            description: dto.description ?? null,
            categoryId: dto.categoryId ?? null,
            brandId: dto.brandId ?? null,
            productType: dto.productType,
            stockMode: dto.stockMode,
            ownership,
            purityKarat: dto.purityKarat ?? null,
            grossWeight: dto.grossWeight ?? '0.000',
            netWeight: dto.netWeight ?? '0.000',
            stoneWeight: dto.stoneWeight ?? '0.000',
            makingCharges: dto.makingCharges ?? '0.000',
            stoneCharges: dto.stoneCharges ?? '0.000',
            vatRate: dto.vatRate ?? null,
            purchasePrice: dto.purchasePrice ?? '0.000',
            sellingPrice: dto.sellingPrice ?? '0.000',
            minStockQty: dto.minStockQty ?? 0,
            minStockWeight: dto.minStockWeight ?? '0.000',
            status: dto.status,
            createdById: userId,
            updatedById: userId,
          },
        });

        await tx.stockBalance.create({
          data: {
            productId: created.id,
            onHandQty: openingQty,
            onHandWeight: openingWeight,
          },
        });

        if (ownership === ProductOwnership.OWN && parseFloat(openingQty) > 0) {
          await tx.stockMovement.create({
            data: {
              productId: created.id,
              type: 'ADJUSTMENT',
              qty: openingQty,
              weight: openingWeight,
              refType: 'OWN_STOCK',
              notes: 'Opening own / workshop stock on product create',
              createdById: userId ?? null,
            },
          });
        }

        return tx.product.findUniqueOrThrow({
          where: { id: created.id },
          include: { category: true, brand: true, stockBalance: true },
        });
      });

      return this.serializeProduct(product);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('SKU or barcode already exists');
      }
      throw e;
    }
  }

  async update(id: string, body: unknown, userId?: string) {
    await this.findOne(id);
    const dto = zodValidate(productSchema.partial(), body);
    // Never apply create-only opening fields on update
    const { ...safe } = dto as Record<string, unknown>;
    delete safe.openingQty;
    delete safe.openingWeight;

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: { ...safe, updatedById: userId },
        include: { category: true, brand: true, stockBalance: true },
      });
      return this.serializeProduct(product);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('SKU or barcode already exists');
      }
      throw e;
    }
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
      include: { category: true, brand: true, stockBalance: true },
    });
    return this.serializeProduct(product);
  }

  private serializeProduct(
    product: Prisma.ProductGetPayload<{
      include: { category: true; brand: true; stockBalance: true };
    }>,
  ) {
    return {
      ...serializeRecord(product),
      category: product.category,
      brand: product.brand,
      stockBalance: product.stockBalance ? serializeRecord(product.stockBalance) : null,
      onHandQty: product.stockBalance ? decimalStr(product.stockBalance.onHandQty) : '0.000',
    };
  }
}
