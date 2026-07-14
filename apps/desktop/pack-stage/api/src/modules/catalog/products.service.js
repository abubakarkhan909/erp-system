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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const zod_validate_1 = require("../../common/utils/zod-validate");
const serialize_1 = require("../../common/utils/serialize");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, pageSize, skip, take, search, sortBy, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { sku: { contains: search } },
                { barcode: { contains: search } },
            ];
        }
        const orderBy = {};
        const allowedSort = ['name', 'sku', 'createdAt', 'sellingPrice'];
        const field = allowedSort.includes(sortBy)
            ? sortBy
            : 'createdAt';
        orderBy[field] = sortDir;
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
        return (0, pagination_1.paginatedResult)(rows.map((p) => this.serializeProduct(p)), total, page, pageSize);
    }
    async findOne(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: {
                category: true,
                brand: true,
                stockBalance: true,
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.serializeProduct(product);
    }
    async create(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(shared_1.productSchema, body);
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
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new common_1.ConflictException('SKU or barcode already exists');
            }
            throw e;
        }
    }
    async update(id, body, userId) {
        await this.findOne(id);
        const dto = (0, zod_validate_1.zodValidate)(shared_1.productSchema.partial(), body);
        try {
            const product = await this.prisma.product.update({
                where: { id },
                data: { ...dto, updatedById: userId },
                include: { category: true, brand: true, stockBalance: true },
            });
            return this.serializeProduct(product);
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new common_1.ConflictException('SKU or barcode already exists');
            }
            throw e;
        }
    }
    async remove(id, userId) {
        await this.findOne(id);
        const product = await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), updatedById: userId },
            include: { category: true, brand: true, stockBalance: true },
        });
        return this.serializeProduct(product);
    }
    serializeProduct(product) {
        return {
            ...(0, serialize_1.serializeRecord)(product),
            category: product.category,
            brand: product.brand,
            stockBalance: product.stockBalance ? (0, serialize_1.serializeRecord)(product.stockBalance) : null,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map