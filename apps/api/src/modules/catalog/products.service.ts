import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { productSchema } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { parsePagination, paginatedResult } from '../../common/utils/pagination';
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
    const dto = zodValidate(productSchema, body);

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
          data: { productId: created.id },
        });

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

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: { ...dto, updatedById: userId },
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
    };
  }
}
