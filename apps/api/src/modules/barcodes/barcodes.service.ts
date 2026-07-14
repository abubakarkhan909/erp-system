import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr } from '../../common/utils/pagination';
import { serializeRecord } from '../../common/utils/serialize';

@Injectable()
export class BarcodesService {
  constructor(private readonly prisma: PrismaService) {}

  /** CODE128-friendly: uppercase alphanumeric, no spaces. */
  generateBarcodeString(sku: string, productId: string): string {
    const base = sku.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
    const suffix = productId.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-6);
    return `${base || 'PRD'}${suffix}`.slice(0, 20);
  }

  async generateForProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (product.barcode) {
      return { productId: product.id, barcode: product.barcode, generated: false };
    }

    let barcode = this.generateBarcodeString(product.sku, product.id);
    let attempt = 0;
    while (attempt < 5) {
      const clash = await this.prisma.product.findFirst({
        where: { barcode, NOT: { id: productId } },
      });
      if (!clash) break;
      attempt += 1;
      barcode = `${barcode}${attempt}`.slice(0, 20);
    }

    const existing = await this.prisma.product.findFirst({ where: { barcode } });
    if (existing && existing.id !== productId) {
      throw new ConflictException('Could not generate unique barcode');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { barcode },
      include: { category: true, brand: true, stockBalance: true },
    });

    return {
      productId: updated.id,
      barcode: updated.barcode,
      generated: true,
      product: {
        ...serializeRecord(updated as unknown as Record<string, unknown>),
        minStockQty: decimalStr(updated.minStockQty),
      },
    };
  }

  async getByBarcode(code: string) {
    const normalized = decodeURIComponent(code).trim();
    const product = await this.prisma.product.findFirst({
      where: {
        deletedAt: null,
        OR: [{ barcode: normalized }, { sku: normalized }],
      },
      include: { category: true, brand: true, stockBalance: true },
    });
    if (!product) throw new NotFoundException('Product not found for barcode');

    return {
      ...serializeRecord(product as unknown as Record<string, unknown>),
      minStockQty: decimalStr(product.minStockQty),
      stockBalance: product.stockBalance
        ? {
            onHandQty: decimalStr(product.stockBalance.onHandQty),
            onHandWeight: decimalStr(product.stockBalance.onHandWeight),
          }
        : null,
    };
  }
}
