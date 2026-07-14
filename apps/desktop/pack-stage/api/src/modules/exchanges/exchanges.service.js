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
exports.ExchangesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const zod_1 = require("zod");
const prisma_service_1 = require("../../prisma/prisma.service");
const number_series_service_1 = require("../number-series/number-series.service");
const journal_helper_1 = require("../../common/utils/journal.helper");
const pagination_1 = require("../../common/utils/pagination");
const zod_validate_1 = require("../../common/utils/zod-validate");
const createExchangeSchema = zod_1.z.object({
    customerId: zod_1.z.string().cuid().optional().nullable(),
    saleInvoiceId: zod_1.z.string().cuid().optional().nullable(),
    exchangeDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    karat: zod_1.z.nativeEnum(client_1.GoldKarat),
    weight: shared_1.moneySchema,
    ratePerGram: shared_1.moneySchema,
    paymentOut: shared_1.moneySchema.default('0.000'),
    notes: zod_1.z.string().max(2000).optional().nullable(),
});
const postExchangeSchema = zod_1.z.object({
    scrapProductId: zod_1.z.string().cuid().optional().nullable(),
});
let ExchangesService = class ExchangesService {
    prisma;
    numberSeries;
    constructor(prisma, numberSeries) {
        this.prisma = prisma;
        this.numberSeries = numberSeries;
    }
    async findAll(query) {
        const { page, pageSize, skip, take, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.customerId)
            where.customerId = query.customerId;
        const [rows, total] = await Promise.all([
            this.prisma.oldGoldExchange.findMany({
                where,
                skip,
                take,
                include: {
                    customer: { select: { id: true, name: true } },
                    saleInvoice: { select: { id: true, number: true, balance: true } },
                },
                orderBy: { createdAt: sortDir },
            }),
            this.prisma.oldGoldExchange.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((r) => this.formatExchange(r)), total, page, pageSize);
    }
    async findOne(id) {
        const row = await this.prisma.oldGoldExchange.findUnique({
            where: { id },
            include: {
                customer: true,
                saleInvoice: { select: { id: true, number: true, total: true, balance: true, paid: true } },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Old gold exchange not found');
        return this.formatExchange(row);
    }
    async create(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(createExchangeSchema, body);
        const weight = new client_1.Prisma.Decimal(dto.weight);
        const rate = new client_1.Prisma.Decimal(dto.ratePerGram);
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
    async post(id, body, userId) {
        const { scrapProductId } = (0, zod_validate_1.zodValidate)(postExchangeSchema, body ?? {});
        const exchange = await this.prisma.oldGoldExchange.findUnique({ where: { id } });
        if (!exchange)
            throw new common_1.NotFoundException('Old gold exchange not found');
        if (exchange.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Only draft exchanges can be posted');
        }
        const value = exchange.value;
        const creditToSale = exchange.saleInvoiceId
            ? client_1.Prisma.Decimal.min(value, await this.getInvoiceBalance(exchange.saleInvoiceId))
            : new client_1.Prisma.Decimal(0);
        const cashOut = exchange.paymentOut.greaterThan(0)
            ? exchange.paymentOut
            : value.sub(creditToSale);
        const scrapProduct = await this.findScrapProduct(scrapProductId);
        const updated = await this.prisma.$transaction(async (tx) => {
            if (scrapProduct) {
                await this.increaseScrapInventory(tx, scrapProduct.id, exchange.weight, exchange.id, userId);
            }
            const journalLines = [];
            if (scrapProduct) {
                journalLines.push({
                    accountCode: '1300',
                    debit: value,
                    narration: `Old gold exchange ${exchange.number} inventory`,
                });
            }
            else {
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
                    partyType: client_1.PartyType.CUSTOMER,
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
            await (0, journal_helper_1.postJournalEntry)(this.prisma, this.numberSeries, {
                entryDate: exchange.exchangeDate,
                memo: `Old gold exchange ${exchange.number}`,
                sourceType: 'EXCHANGE',
                sourceId: exchange.id,
                userId,
                lines: journalLines,
            }, tx);
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
    async getInvoiceBalance(saleInvoiceId) {
        const inv = await this.prisma.saleInvoice.findUnique({ where: { id: saleInvoiceId } });
        if (!inv)
            throw new common_1.NotFoundException('Linked sale invoice not found');
        return inv.balance;
    }
    async findScrapProduct(explicitId) {
        if (explicitId) {
            const p = await this.prisma.product.findFirst({
                where: { id: explicitId, deletedAt: null, productType: client_1.ProductType.RAW_GOLD },
            });
            if (p)
                return p;
        }
        return this.prisma.product.findFirst({
            where: { deletedAt: null, productType: client_1.ProductType.RAW_GOLD, status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' },
        });
    }
    async increaseScrapInventory(tx, productId, weight, refId, userId) {
        await tx.stockMovement.create({
            data: {
                productId,
                type: client_1.StockMovementType.EXCHANGE_IN,
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
        }
        else {
            await tx.stockBalance.create({
                data: { productId, onHandWeight: weight },
            });
        }
    }
    formatExchange(row) {
        return {
            id: row.id,
            number: row.number,
            customerId: row.customerId,
            customer: row.customer,
            saleInvoiceId: row.saleInvoiceId,
            saleInvoice: row.saleInvoice
                ? {
                    ...row.saleInvoice,
                    balance: row.saleInvoice.balance != null ? (0, pagination_1.decimalStr)(row.saleInvoice.balance) : undefined,
                }
                : null,
            exchangeDate: row.exchangeDate.toISOString().slice(0, 10),
            karat: row.karat,
            weight: (0, pagination_1.decimalStr)(row.weight),
            ratePerGram: (0, pagination_1.decimalStr)(row.ratePerGram),
            value: (0, pagination_1.decimalStr)(row.value),
            paymentOut: (0, pagination_1.decimalStr)(row.paymentOut),
            status: row.status,
            notes: row.notes,
            postedAt: row.postedAt?.toISOString() ?? null,
            createdAt: row.createdAt.toISOString(),
        };
    }
};
exports.ExchangesService = ExchangesService;
exports.ExchangesService = ExchangesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        number_series_service_1.NumberSeriesService])
], ExchangesService);
//# sourceMappingURL=exchanges.service.js.map