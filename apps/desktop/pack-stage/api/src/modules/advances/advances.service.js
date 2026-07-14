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
exports.AdvancesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const zod_1 = require("zod");
const prisma_service_1 = require("../../prisma/prisma.service");
const number_series_service_1 = require("../number-series/number-series.service");
const journal_helper_1 = require("../../common/utils/journal.helper");
const pagination_1 = require("../../common/utils/pagination");
const zod_validate_1 = require("../../common/utils/zod-validate");
const serialize_1 = require("../../common/utils/serialize");
const statusTransitionSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.AdvanceOrderStatus),
});
const advancePaymentSchema = zod_1.z.object({
    amount: shared_1.moneySchema,
});
const customOrderSchema = zod_1.z.object({
    customerId: zod_1.z.string().cuid(),
    specs: zod_1.z.string().min(1).max(5000),
    karat: zod_1.z.nativeEnum(client_1.GoldKarat).optional().nullable(),
    estimatedWeight: shared_1.moneySchema.optional().nullable(),
    estimatedAmount: shared_1.moneySchema.default('0.000'),
    advancePaid: shared_1.moneySchema.default('0.000'),
    expectedDelivery: zod_1.z.string().or(zod_1.z.coerce.date()).optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.AdvanceOrderStatus).default(client_1.AdvanceOrderStatus.PENDING),
});
const repairOrderSchema = zod_1.z.object({
    customerId: zod_1.z.string().cuid(),
    description: zod_1.z.string().min(1).max(5000),
    estimatedAmount: shared_1.moneySchema.default('0.000'),
    advancePaid: shared_1.moneySchema.default('0.000'),
    expectedDelivery: zod_1.z.string().or(zod_1.z.coerce.date()).optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.AdvanceOrderStatus).default(client_1.AdvanceOrderStatus.PENDING),
});
const VALID_TRANSITIONS = {
    PENDING: ['READY', 'CANCELLED'],
    READY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
};
let AdvancesService = class AdvancesService {
    prisma;
    numberSeries;
    constructor(prisma, numberSeries) {
        this.prisma = prisma;
        this.numberSeries = numberSeries;
    }
    assertTransition(from, to) {
        if (!VALID_TRANSITIONS[from].includes(to)) {
            throw new common_1.BadRequestException(`Cannot transition from ${from} to ${to}`);
        }
    }
    async listAdvanceOrders(query) {
        const { page, pageSize, skip, take, search, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { orderNo: { contains: search } },
                { description: { contains: search } },
                { customer: { name: { contains: search } } },
            ];
        }
        if (query.status)
            where.status = query.status;
        const [rows, total] = await Promise.all([
            this.prisma.advanceOrder.findMany({
                where,
                skip,
                take,
                include: { customer: { select: { id: true, name: true, phone: true } } },
                orderBy: { createdAt: sortDir },
            }),
            this.prisma.advanceOrder.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((r) => this.formatAdvanceOrder(r)), total, page, pageSize);
    }
    async getAdvanceOrder(id) {
        const order = await this.prisma.advanceOrder.findFirst({
            where: { id, deletedAt: null },
            include: { customer: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Advance order not found');
        return this.formatAdvanceOrder(order);
    }
    async createAdvanceOrder(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(shared_1.advanceOrderSchema, body);
        const orderNo = await this.numberSeries.nextNumber('ADVANCE_ORDER', 'AO');
        const total = new client_1.Prisma.Decimal(dto.totalAmount);
        const advance = new client_1.Prisma.Decimal(dto.advancePaid ?? '0.000');
        const remaining = total.sub(advance);
        const order = await this.prisma.advanceOrder.create({
            data: {
                orderNo,
                customerId: dto.customerId,
                description: dto.description,
                expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : null,
                totalAmount: total,
                advancePaid: advance,
                remaining,
                status: dto.status,
                notes: dto.notes ?? null,
                createdById: userId,
            },
            include: { customer: { select: { id: true, name: true } } },
        });
        if (advance.greaterThan(0)) {
            await this.postAdvanceJournal(order.id, advance, userId, `Advance order ${orderNo}`);
        }
        return this.formatAdvanceOrder(order);
    }
    async updateAdvanceOrder(id, body, userId) {
        await this.getAdvanceOrder(id);
        const dto = (0, zod_validate_1.zodValidate)(shared_1.advanceOrderSchema.partial(), body);
        const existing = await this.prisma.advanceOrder.findUniqueOrThrow({ where: { id } });
        const total = dto.totalAmount != null ? new client_1.Prisma.Decimal(dto.totalAmount) : existing.totalAmount;
        const advance = dto.advancePaid != null ? new client_1.Prisma.Decimal(dto.advancePaid) : existing.advancePaid;
        const remaining = total.sub(advance);
        const order = await this.prisma.advanceOrder.update({
            where: { id },
            data: {
                customerId: dto.customerId,
                description: dto.description,
                expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : undefined,
                totalAmount: dto.totalAmount != null ? total : undefined,
                advancePaid: dto.advancePaid != null ? advance : undefined,
                remaining: dto.totalAmount != null || dto.advancePaid != null ? remaining : undefined,
                notes: dto.notes,
                status: dto.status,
            },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatAdvanceOrder(order);
    }
    async transitionAdvanceOrderStatus(id, body, _userId) {
        const { status } = (0, zod_validate_1.zodValidate)(statusTransitionSchema, body);
        const order = await this.prisma.advanceOrder.findFirst({ where: { id, deletedAt: null } });
        if (!order)
            throw new common_1.NotFoundException('Advance order not found');
        this.assertTransition(order.status, status);
        const updated = await this.prisma.advanceOrder.update({
            where: { id },
            data: { status },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatAdvanceOrder(updated);
    }
    async recordAdvancePayment(id, body, userId) {
        const { amount } = (0, zod_validate_1.zodValidate)(advancePaymentSchema, body);
        const payment = new client_1.Prisma.Decimal(amount);
        const order = await this.prisma.advanceOrder.findFirst({ where: { id, deletedAt: null } });
        if (!order)
            throw new common_1.NotFoundException('Advance order not found');
        if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
            throw new common_1.BadRequestException('Cannot record payment on closed order');
        }
        const newAdvance = order.advancePaid.add(payment);
        const newRemaining = order.totalAmount.sub(newAdvance);
        if (newRemaining.lessThan(0)) {
            throw new common_1.BadRequestException('Payment exceeds remaining balance');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const row = await tx.advanceOrder.update({
                where: { id },
                data: { advancePaid: newAdvance, remaining: newRemaining },
                include: { customer: { select: { id: true, name: true } } },
            });
            await this.postAdvanceJournal(id, payment, userId, `Advance payment ${order.orderNo}`, tx);
            return row;
        });
        return this.formatAdvanceOrder(updated);
    }
    async removeAdvanceOrder(id, userId) {
        await this.getAdvanceOrder(id);
        const order = await this.prisma.advanceOrder.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return (0, serialize_1.serializeRecord)(order);
    }
    async postAdvanceJournal(sourceId, amount, userId, memo, tx) {
        await (0, journal_helper_1.postJournalEntry)(this.prisma, this.numberSeries, {
            entryDate: new Date(),
            memo: memo ?? 'Customer advance received',
            sourceType: 'ADVANCE_ORDER',
            sourceId,
            userId,
            lines: [
                { accountCode: '1000', debit: amount, narration: 'Cash received' },
                { accountCode: '2200', credit: amount, narration: 'Customer advances' },
            ],
        }, tx);
    }
    formatAdvanceOrder(order) {
        return {
            id: order.id,
            orderNo: order.orderNo,
            customerId: order.customerId,
            customer: order.customer,
            description: order.description,
            expectedDelivery: order.expectedDelivery?.toISOString().slice(0, 10) ?? null,
            totalAmount: (0, pagination_1.decimalStr)(order.totalAmount),
            advancePaid: (0, pagination_1.decimalStr)(order.advancePaid),
            remaining: (0, pagination_1.decimalStr)(order.remaining),
            status: order.status,
            notes: order.notes,
            createdAt: order.createdAt.toISOString(),
        };
    }
    async listCustomOrders(query) {
        const { page, pageSize, skip, take, search, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = {};
        if (search) {
            where.OR = [
                { orderNo: { contains: search } },
                { specs: { contains: search } },
                { customer: { name: { contains: search } } },
            ];
        }
        if (query.status)
            where.status = query.status;
        const [rows, total] = await Promise.all([
            this.prisma.customOrder.findMany({
                where,
                skip,
                take,
                include: { customer: { select: { id: true, name: true } } },
                orderBy: { createdAt: sortDir },
            }),
            this.prisma.customOrder.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((r) => this.formatCustomOrder(r)), total, page, pageSize);
    }
    async getCustomOrder(id) {
        const order = await this.prisma.customOrder.findUnique({
            where: { id },
            include: { customer: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Custom order not found');
        return this.formatCustomOrder(order);
    }
    async createCustomOrder(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(customOrderSchema, body);
        const orderNo = await this.numberSeries.nextNumber('CUSTOM_ORDER', 'CO');
        const order = await this.prisma.customOrder.create({
            data: {
                orderNo,
                customerId: dto.customerId,
                specs: dto.specs,
                karat: dto.karat ?? null,
                estimatedWeight: dto.estimatedWeight ?? null,
                estimatedAmount: dto.estimatedAmount,
                advancePaid: dto.advancePaid,
                expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : null,
                status: dto.status,
                createdById: userId,
            },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatCustomOrder(order);
    }
    async updateCustomOrder(id, body, _userId) {
        await this.getCustomOrder(id);
        const dto = (0, zod_validate_1.zodValidate)(customOrderSchema.partial(), body);
        const order = await this.prisma.customOrder.update({
            where: { id },
            data: {
                ...dto,
                expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : undefined,
            },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatCustomOrder(order);
    }
    async transitionCustomOrderStatus(id, body, _userId) {
        const { status } = (0, zod_validate_1.zodValidate)(statusTransitionSchema, body);
        const order = await this.prisma.customOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Custom order not found');
        this.assertTransition(order.status, status);
        const updated = await this.prisma.customOrder.update({
            where: { id },
            data: { status },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatCustomOrder(updated);
    }
    formatCustomOrder(order) {
        return {
            id: order.id,
            orderNo: order.orderNo,
            customerId: order.customerId,
            customer: order.customer,
            specs: order.specs,
            karat: order.karat,
            estimatedWeight: order.estimatedWeight != null ? (0, pagination_1.decimalStr)(order.estimatedWeight) : null,
            estimatedAmount: (0, pagination_1.decimalStr)(order.estimatedAmount),
            advancePaid: (0, pagination_1.decimalStr)(order.advancePaid),
            expectedDelivery: order.expectedDelivery?.toISOString().slice(0, 10) ?? null,
            status: order.status,
            createdAt: order.createdAt.toISOString(),
        };
    }
    async listRepairOrders(query) {
        const { page, pageSize, skip, take, search, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = {};
        if (search) {
            where.OR = [
                { orderNo: { contains: search } },
                { description: { contains: search } },
                { customer: { name: { contains: search } } },
            ];
        }
        if (query.status)
            where.status = query.status;
        const [rows, total] = await Promise.all([
            this.prisma.repairOrder.findMany({
                where,
                skip,
                take,
                include: { customer: { select: { id: true, name: true } } },
                orderBy: { createdAt: sortDir },
            }),
            this.prisma.repairOrder.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((r) => this.formatRepairOrder(r)), total, page, pageSize);
    }
    async getRepairOrder(id) {
        const order = await this.prisma.repairOrder.findUnique({
            where: { id },
            include: { customer: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Repair order not found');
        return this.formatRepairOrder(order);
    }
    async createRepairOrder(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(repairOrderSchema, body);
        const orderNo = await this.numberSeries.nextNumber('REPAIR_ORDER', 'RO');
        const order = await this.prisma.repairOrder.create({
            data: {
                orderNo,
                customerId: dto.customerId,
                description: dto.description,
                estimatedAmount: dto.estimatedAmount,
                advancePaid: dto.advancePaid,
                expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : null,
                status: dto.status,
                createdById: userId,
            },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatRepairOrder(order);
    }
    async updateRepairOrder(id, body, _userId) {
        await this.getRepairOrder(id);
        const dto = (0, zod_validate_1.zodValidate)(repairOrderSchema.partial(), body);
        const order = await this.prisma.repairOrder.update({
            where: { id },
            data: {
                ...dto,
                expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : undefined,
            },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatRepairOrder(order);
    }
    async transitionRepairOrderStatus(id, body, _userId) {
        const { status } = (0, zod_validate_1.zodValidate)(statusTransitionSchema, body);
        const order = await this.prisma.repairOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Repair order not found');
        this.assertTransition(order.status, status);
        const updated = await this.prisma.repairOrder.update({
            where: { id },
            data: { status },
            include: { customer: { select: { id: true, name: true } } },
        });
        return this.formatRepairOrder(updated);
    }
    formatRepairOrder(order) {
        return {
            id: order.id,
            orderNo: order.orderNo,
            customerId: order.customerId,
            customer: order.customer,
            description: order.description,
            estimatedAmount: (0, pagination_1.decimalStr)(order.estimatedAmount),
            advancePaid: (0, pagination_1.decimalStr)(order.advancePaid),
            expectedDelivery: order.expectedDelivery?.toISOString().slice(0, 10) ?? null,
            status: order.status,
            createdAt: order.createdAt.toISOString(),
        };
    }
};
exports.AdvancesService = AdvancesService;
exports.AdvancesService = AdvancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        number_series_service_1.NumberSeriesService])
], AdvancesService);
//# sourceMappingURL=advances.service.js.map