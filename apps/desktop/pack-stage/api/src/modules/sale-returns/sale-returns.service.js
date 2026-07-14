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
exports.SaleReturnsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const number_series_service_1 = require("../number-series/number-series.service");
const inventory_service_1 = require("../inventory/inventory.service");
const accounting_service_1 = require("../accounting/accounting.service");
const accounting_constants_1 = require("../accounting/accounting.constants");
const pagination_1 = require("../../common/utils/pagination");
const pagination_2 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
const zod_validate_1 = require("../../common/utils/zod-validate");
const zod_1 = require("zod");
const shared_2 = require("@jewelry-erp/shared");
const saleReturnItemSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    quantity: zod_1.z.coerce.number().positive(),
    netWeight: shared_2.moneySchema.default('0.000'),
    lineNet: shared_2.moneySchema.optional(),
    vatRate: shared_2.moneySchema.default('5.000'),
});
const createSaleReturnSchema = zod_1.z.object({
    saleInvoiceId: zod_1.z.string().cuid(),
    returnDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    notes: zod_1.z.string().max(2000).optional().nullable(),
    items: zod_1.z.array(saleReturnItemSchema).min(1),
    refundAmount: shared_2.moneySchema.optional(),
    refundMethod: zod_1.z.nativeEnum(client_1.PaymentMethod).optional(),
    bankAccountId: zod_1.z.string().cuid().optional().nullable(),
});
let SaleReturnsService = class SaleReturnsService {
    prisma;
    numberSeries;
    inventory;
    accounting;
    constructor(prisma, numberSeries, inventory, accounting) {
        this.prisma = prisma;
        this.numberSeries = numberSeries;
        this.inventory = inventory;
        this.accounting = accounting;
    }
    async findAll(query) {
        const { page, pageSize, skip, take } = (0, pagination_2.parsePagination)(query);
        const where = {};
        if (query.saleInvoiceId)
            where.saleInvoiceId = String(query.saleInvoiceId);
        const [rows, total] = await Promise.all([
            this.prisma.saleReturn.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    saleInvoice: { select: { id: true, number: true } },
                    customer: { select: { id: true, name: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.saleReturn.count({ where }),
        ]);
        return (0, pagination_2.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async findOne(id) {
        const ret = await this.prisma.saleReturn.findUnique({
            where: { id },
            include: {
                saleInvoice: true,
                customer: true,
                items: true,
            },
        });
        if (!ret)
            throw new common_1.NotFoundException('Sale return not found');
        return {
            ...(0, serialize_1.serializeRecord)(ret),
            items: (0, serialize_1.serializeMany)(ret.items),
        };
    }
    async createFromSale(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(createSaleReturnSchema, body);
        const sale = await this.prisma.saleInvoice.findFirst({
            where: { id: dto.saleInvoiceId, deletedAt: null, status: client_1.DocumentStatus.POSTED },
            include: { items: true },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Posted sale invoice not found');
        }
        const computedItems = dto.items.map((item) => {
            const saleLine = sale.items.find((si) => si.productId === item.productId);
            const net = item.lineNet ??
                (saleLine
                    ? (0, shared_1.roundMoney)((parseFloat(saleLine.lineNet.toString()) *
                        (parseFloat(String(item.quantity)) /
                            parseFloat(saleLine.quantity.toString()))).toFixed(3))
                    : '0.000');
            const { vat, gross } = (0, shared_1.calcVat)(net, item.vatRate ?? '5.000');
            return {
                ...item,
                lineNet: net,
                vatAmount: vat,
                lineTotal: gross,
            };
        });
        const taxable = computedItems.reduce((s, i) => (0, shared_1.addMoney)(s, i.lineNet), '0.000');
        const vatAmount = computedItems.reduce((s, i) => (0, shared_1.addMoney)(s, i.vatAmount), '0.000');
        const total = (0, shared_1.addMoney)(taxable, vatAmount);
        const saleReturn = await this.prisma.saleReturn.create({
            data: {
                number: `SR-DRAFT-${Date.now()}`,
                saleInvoiceId: dto.saleInvoiceId,
                customerId: sale.customerId,
                returnDate: dto.returnDate ? new Date(dto.returnDate) : new Date(),
                status: client_1.DocumentStatus.DRAFT,
                taxable,
                vatAmount,
                total,
                refundAmount: (0, shared_1.roundMoney)(dto.refundAmount ?? total),
                notes: dto.notes ?? null,
                createdById: userId,
                items: {
                    create: computedItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        netWeight: item.netWeight,
                        lineNet: item.lineNet,
                        vatRate: item.vatRate,
                        vatAmount: item.vatAmount,
                        lineTotal: item.lineTotal,
                    })),
                },
            },
            include: { items: true, saleInvoice: true, customer: true },
        });
        return {
            ...(0, serialize_1.serializeRecord)(saleReturn),
            items: (0, serialize_1.serializeMany)(saleReturn.items),
        };
    }
    async post(id, body, userId) {
        const refundSchema = zod_1.z.object({
            refundMethod: zod_1.z.nativeEnum(client_1.PaymentMethod).optional(),
            bankAccountId: zod_1.z.string().cuid().optional().nullable(),
            refundAmount: shared_2.moneySchema.optional(),
        });
        const extra = (0, zod_validate_1.zodValidate)(refundSchema, body ?? {});
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.saleReturn.findUnique({
                where: { id },
                include: { items: true, saleInvoice: true },
            });
            if (!ret)
                throw new common_1.NotFoundException('Sale return not found');
            if (ret.status !== client_1.DocumentStatus.DRAFT) {
                throw new common_1.BadRequestException('Return already posted');
            }
            const number = await this.numberSeries.nextNumber('SALE_RETURN', 'SR', tx);
            const refundAmount = (0, shared_1.roundMoney)(extra.refundAmount ?? (0, pagination_1.decimalStr)(ret.refundAmount));
            const refundMethod = extra.refundMethod ?? client_1.PaymentMethod.CASH;
            for (const item of ret.items) {
                await this.inventory.adjustStock(tx, {
                    productId: item.productId,
                    type: 'SALE_RETURN',
                    qty: (0, pagination_1.decimalStr)(item.quantity),
                    weight: (0, pagination_1.decimalStr)(item.netWeight),
                    refType: 'SALE_RETURN',
                    refId: id,
                    createdById: userId,
                });
            }
            if (ret.customerId) {
                await tx.customer.update({
                    where: { id: ret.customerId },
                    data: { currentBalance: { decrement: (0, pagination_1.decimalStr)(ret.total) } },
                });
            }
            const lines = [
                {
                    accountCode: accounting_constants_1.ACCOUNT_CODES.SALES,
                    debit: (0, pagination_1.decimalStr)(ret.taxable),
                    credit: '0.000',
                },
                {
                    accountCode: accounting_constants_1.ACCOUNT_CODES.OUTPUT_VAT,
                    debit: (0, pagination_1.decimalStr)(ret.vatAmount),
                    credit: '0.000',
                },
            ];
            if (refundMethod === client_1.PaymentMethod.CASH) {
                lines.push({
                    accountCode: accounting_constants_1.ACCOUNT_CODES.CASH,
                    debit: '0.000',
                    credit: refundAmount,
                });
            }
            else {
                lines.push({
                    accountCode: accounting_constants_1.ACCOUNT_CODES.BANK,
                    debit: '0.000',
                    credit: refundAmount,
                });
                if (extra.bankAccountId) {
                    await tx.bankAccount.update({
                        where: { id: extra.bankAccountId },
                        data: { currentBalance: { decrement: refundAmount } },
                    });
                }
            }
            await this.accounting.postJournal(tx, {
                entryDate: ret.returnDate,
                memo: `Sale return ${number}`,
                sourceType: 'SALE_RETURN',
                sourceId: id,
                createdById: userId,
                lines,
            });
            const updated = await tx.saleReturn.update({
                where: { id },
                data: {
                    number,
                    status: client_1.DocumentStatus.POSTED,
                    refundAmount,
                    postedAt: new Date(),
                },
                include: { items: true, saleInvoice: true, customer: true },
            });
            return {
                ...(0, serialize_1.serializeRecord)(updated),
                items: (0, serialize_1.serializeMany)(updated.items),
            };
        });
    }
};
exports.SaleReturnsService = SaleReturnsService;
exports.SaleReturnsService = SaleReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        number_series_service_1.NumberSeriesService,
        inventory_service_1.InventoryService,
        accounting_service_1.AccountingService])
], SaleReturnsService);
//# sourceMappingURL=sale-returns.service.js.map