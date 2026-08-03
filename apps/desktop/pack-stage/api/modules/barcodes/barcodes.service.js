"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
let BarcodesService = class BarcodesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateBarcodeString(sku, productId) {
        const base = sku.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
        const suffix = productId.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-6);
        return `${base || 'PRD'}${suffix}`.slice(0, 20);
    }
    async generateForProduct(productId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, deletedAt: null },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.barcode) {
            return { productId: product.id, barcode: product.barcode, generated: false };
        }
        let barcode = this.generateBarcodeString(product.sku, product.id);
        let attempt = 0;
        while (attempt < 5) {
            const clash = await this.prisma.product.findFirst({
                where: { barcode, NOT: { id: productId } },
            });
            if (!clash)
                break;
            attempt += 1;
            barcode = `${barcode}${attempt}`.slice(0, 20);
        }
        const existing = await this.prisma.product.findFirst({ where: { barcode } });
        if (existing && existing.id !== productId) {
            throw new common_1.ConflictException('Could not generate unique barcode');
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
                ...(0, serialize_1.serializeRecord)(updated),
                minStockQty: (0, pagination_1.decimalStr)(updated.minStockQty),
            },
        };
    }
    async getByBarcode(code) {
        const normalized = decodeURIComponent(code).trim();
        const product = await this.prisma.product.findFirst({
            where: {
                deletedAt: null,
                OR: [{ barcode: normalized }, { sku: normalized }],
            },
            include: { category: true, brand: true, stockBalance: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found for barcode');
        return {
            ...(0, serialize_1.serializeRecord)(product),
            minStockQty: (0, pagination_1.decimalStr)(product.minStockQty),
            stockBalance: product.stockBalance
                ? {
                    onHandQty: (0, pagination_1.decimalStr)(product.stockBalance.onHandQty),
                    onHandWeight: (0, pagination_1.decimalStr)(product.stockBalance.onHandWeight),
                }
                : null,
        };
    }
};
exports.BarcodesService = BarcodesService;
exports.BarcodesService = BarcodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BarcodesService);
//# sourceMappingURL=barcodes.service.js.map