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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@jewelry-erp/shared");
const zod_1 = require("zod");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const pagination_2 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
const zod_validate_1 = require("../../common/utils/zod-validate");
const OUTBOUND_TYPES = [
    'SALE',
    'PURCHASE_RETURN',
    'DAMAGE',
    'RESERVE',
];
const ownStockSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    qty: zod_1.z.coerce.number().positive('Quantity must be greater than 0'),
    weight: shared_1.moneySchema.optional().nullable(),
    notes: zod_1.z.string().max(500).optional().nullable(),
});
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async adjustStock(tx, input) {
        const product = await tx.product.findFirst({
            where: { id: input.productId, deletedAt: null },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const absQty = (0, shared_1.roundMoney)(Math.abs(parseFloat(input.qty || '0')).toFixed(3));
        const absWeight = (0, shared_1.roundMoney)(Math.abs(parseFloat(input.weight || '0')).toFixed(3));
        let qtyDelta = absQty;
        let weightDelta = absWeight;
        let reservedQtyDelta = '0.000';
        let reservedWeightDelta = '0.000';
        if (input.type === 'ADJUSTMENT') {
            qtyDelta = (0, shared_1.roundMoney)(input.qty);
            weightDelta = (0, shared_1.roundMoney)(input.weight);
        }
        else if (input.type === 'RESERVE') {
            qtyDelta = (0, shared_1.roundMoney)(`-${absQty}`);
            weightDelta = (0, shared_1.roundMoney)(`-${absWeight}`);
            reservedQtyDelta = absQty;
            reservedWeightDelta = absWeight;
        }
        else if (input.type === 'RELEASE') {
            qtyDelta = absQty;
            weightDelta = absWeight;
            reservedQtyDelta = (0, shared_1.roundMoney)(`-${absQty}`);
            reservedWeightDelta = (0, shared_1.roundMoney)(`-${absWeight}`);
        }
        else if (OUTBOUND_TYPES.includes(input.type)) {
            qtyDelta = (0, shared_1.roundMoney)(`-${absQty}`);
            weightDelta = (0, shared_1.roundMoney)(`-${absWeight}`);
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
        const fresh = await tx.stockBalance.findUniqueOrThrow({
            where: { productId: input.productId },
        });
        const onHandQty = parseFloat((0, pagination_1.decimalStr)(fresh.onHandQty));
        const onHandWeight = parseFloat((0, pagination_1.decimalStr)(fresh.onHandWeight));
        if (onHandQty < -0.0001 || onHandWeight < -0.0001) {
            throw new common_1.BadRequestException('Insufficient stock');
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
    async addOwnStock(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(ownStockSchema, body);
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, deletedAt: null },
            include: { stockBalance: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const qty = (0, shared_1.roundMoney)(String(dto.qty));
        let weight = dto.weight != null && dto.weight !== '' ? (0, shared_1.roundMoney)(dto.weight) : null;
        if (weight == null || parseFloat(weight) <= 0) {
            const unitNet = parseFloat((0, pagination_1.decimalStr)(product.netWeight));
            if (unitNet > 0) {
                weight = (0, shared_1.roundMoney)((unitNet * parseFloat(qty)).toFixed(3));
            }
            else {
                weight = '0.000';
            }
        }
        const result = await this.prisma.$transaction((tx) => this.adjustStock(tx, {
            productId: dto.productId,
            type: 'ADJUSTMENT',
            qty,
            weight,
            refType: 'OWN_STOCK',
            notes: dto.notes?.trim() || 'Own / opening stock (workshop production)',
            createdById: userId,
        }));
        return {
            product: {
                id: product.id,
                sku: product.sku,
                name: product.name,
            },
            addedQty: qty,
            addedWeight: weight,
            onHandQty: (0, pagination_1.decimalStr)(result.balance.onHandQty),
            onHandWeight: (0, pagination_1.decimalStr)(result.balance.onHandWeight),
            movementId: result.movement.id,
        };
    }
    async listMovements(query) {
        const { page, pageSize, skip, take } = (0, pagination_2.parsePagination)(query);
        const where = {};
        if (query.productId)
            where.productId = String(query.productId);
        if (query.refType)
            where.refType = String(query.refType);
        if (query.refId)
            where.refId = String(query.refId);
        if (query.type)
            where.type = query.type;
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
        return (0, pagination_2.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async getBalances(query) {
        const { page, pageSize, skip, take, search } = (0, pagination_2.parsePagination)(query);
        const where = {
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
        return (0, pagination_2.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
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
            if (b.product.status !== 'ACTIVE')
                return false;
            const minQty = parseFloat((0, pagination_1.decimalStr)(b.product.minStockQty));
            const minWeight = parseFloat((0, pagination_1.decimalStr)(b.product.minStockWeight));
            const onHandQty = parseFloat((0, pagination_1.decimalStr)(b.onHandQty));
            const onHandWeight = parseFloat((0, pagination_1.decimalStr)(b.onHandWeight));
            return ((minQty > 0 && onHandQty <= minQty) ||
                (minWeight > 0 && onHandWeight <= minWeight));
        });
        return (0, serialize_1.serializeMany)(low);
    }
    async manualAdjustment(body) {
        return this.prisma.$transaction((tx) => this.adjustStock(tx, body));
    }
    async getBalanceForProduct(productId) {
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
        return (0, serialize_1.serializeRecord)(balance);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map