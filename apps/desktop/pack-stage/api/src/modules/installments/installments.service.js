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
exports.InstallmentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const zod_1 = require("zod");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const zod_validate_1 = require("../../common/utils/zod-validate");
const date_range_1 = require("../../common/utils/date-range");
const createPlanSchema = zod_1.z.object({
    saleInvoiceId: zod_1.z.string().cuid(),
    advanceAmount: shared_1.moneySchema.default('0.000'),
    installmentCount: zod_1.z.coerce.number().int().min(1).max(60),
    firstDueDate: zod_1.z.string().or(zod_1.z.coerce.date()),
    installmentAmount: shared_1.moneySchema.optional(),
});
const recordPaymentSchema = zod_1.z.object({
    amount: shared_1.moneySchema,
});
let InstallmentsService = class InstallmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPlan(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(createPlanSchema, body);
        const invoice = await this.prisma.saleInvoice.findFirst({
            where: { id: dto.saleInvoiceId, deletedAt: null, status: 'POSTED' },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Posted sale invoice not found');
        const existing = await this.prisma.installmentPlan.findUnique({
            where: { saleInvoiceId: dto.saleInvoiceId },
        });
        if (existing)
            throw new common_1.ConflictException('Installment plan already exists for this invoice');
        const total = invoice.balance.greaterThan(0) ? invoice.balance : invoice.total;
        const advance = new client_1.Prisma.Decimal(dto.advanceAmount ?? '0.000');
        const remaining = total.sub(advance);
        if (remaining.lessThanOrEqualTo(0)) {
            throw new common_1.BadRequestException('Nothing to finance after advance');
        }
        const installmentAmount = dto.installmentAmount != null
            ? new client_1.Prisma.Decimal(dto.installmentAmount)
            : remaining.div(dto.installmentCount).toDecimalPlaces(3);
        const firstDue = new Date(dto.firstDueDate);
        const schedules = [];
        let allocated = new client_1.Prisma.Decimal(0);
        for (let i = 0; i < dto.installmentCount; i++) {
            const dueDate = new Date(firstDue);
            dueDate.setUTCMonth(dueDate.getUTCMonth() + i);
            const amount = i === dto.installmentCount - 1
                ? remaining.sub(allocated)
                : installmentAmount;
            schedules.push({ dueDate, amount });
            allocated = allocated.add(amount);
        }
        const plan = await this.prisma.installmentPlan.create({
            data: {
                saleInvoiceId: dto.saleInvoiceId,
                totalAmount: total,
                advanceAmount: advance,
                remainingAmount: remaining,
                installmentAmount,
                installmentCount: dto.installmentCount,
                createdById: userId,
                schedules: {
                    create: schedules.map((s) => ({
                        dueDate: s.dueDate,
                        amount: s.amount,
                    })),
                },
            },
            include: {
                schedules: { orderBy: { dueDate: 'asc' } },
                saleInvoice: { select: { id: true, number: true, customerId: true } },
            },
        });
        return this.formatPlan(plan);
    }
    async listPlans(query) {
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const [rows, total] = await Promise.all([
            this.prisma.installmentPlan.findMany({
                skip,
                take,
                include: {
                    saleInvoice: { select: { id: true, number: true, customerId: true } },
                    schedules: { select: { status: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.installmentPlan.count(),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((p) => ({
            id: p.id,
            saleInvoice: p.saleInvoice,
            totalAmount: (0, pagination_1.decimalStr)(p.totalAmount),
            remainingAmount: (0, pagination_1.decimalStr)(p.remainingAmount),
            installmentCount: p.installmentCount,
            paidCount: p.schedules.filter((s) => s.status === 'PAID').length,
            createdAt: p.createdAt.toISOString(),
        })), total, page, pageSize);
    }
    async getPlan(id) {
        const plan = await this.prisma.installmentPlan.findUnique({
            where: { id },
            include: {
                schedules: { orderBy: { dueDate: 'asc' } },
                saleInvoice: { select: { id: true, number: true, customerId: true, total: true, balance: true } },
            },
        });
        if (!plan)
            throw new common_1.NotFoundException('Installment plan not found');
        return this.formatPlan(plan);
    }
    async listSchedules(planId, query) {
        await this.getPlan(planId);
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = { installmentPlanId: planId };
        const [rows, total] = await Promise.all([
            this.prisma.installmentSchedule.findMany({
                where,
                skip,
                take,
                orderBy: { dueDate: 'asc' },
            }),
            this.prisma.installmentSchedule.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((s) => this.formatSchedule(s)), total, page, pageSize);
    }
    async recordPayment(scheduleId, body, _userId) {
        const { amount } = (0, zod_validate_1.zodValidate)(recordPaymentSchema, body);
        const payment = new client_1.Prisma.Decimal(amount);
        const schedule = await this.prisma.installmentSchedule.findUnique({
            where: { id: scheduleId },
            include: { installmentPlan: true },
        });
        if (!schedule)
            throw new common_1.NotFoundException('Installment schedule not found');
        if (schedule.status === 'PAID') {
            throw new common_1.BadRequestException('Schedule already fully paid');
        }
        const newPaid = schedule.paidAmount.add(payment);
        const due = schedule.amount;
        if (newPaid.greaterThan(due)) {
            throw new common_1.BadRequestException('Payment exceeds schedule amount');
        }
        const today = (0, date_range_1.startOfDayUtc)(new Date());
        let status;
        if (newPaid.equals(due)) {
            status = 'PAID';
        }
        else {
            status = schedule.dueDate < today ? 'LATE' : 'PARTIAL';
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const sched = await tx.installmentSchedule.update({
                where: { id: scheduleId },
                data: {
                    paidAmount: newPaid,
                    status,
                    paidAt: status === 'PAID' ? new Date() : schedule.paidAt,
                },
            });
            const planRemaining = schedule.installmentPlan.remainingAmount.sub(payment);
            await tx.installmentPlan.update({
                where: { id: schedule.installmentPlanId },
                data: { remainingAmount: planRemaining.lessThan(0) ? 0 : planRemaining },
            });
            const invoice = await tx.saleInvoice.findUnique({
                where: { id: schedule.installmentPlan.saleInvoiceId },
            });
            if (invoice) {
                const newPaidInv = invoice.paid.add(payment);
                const newBalance = invoice.total.sub(newPaidInv);
                await tx.saleInvoice.update({
                    where: { id: invoice.id },
                    data: { paid: newPaidInv, balance: newBalance.lessThan(0) ? 0 : newBalance },
                });
            }
            return sched;
        });
        return this.formatSchedule(updated);
    }
    async upcoming(query) {
        const days = Number(query.days) || 30;
        const today = (0, date_range_1.startOfDayUtc)(new Date());
        const until = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = {
            dueDate: { gte: today, lte: until },
            status: { in: ['PENDING', 'PARTIAL'] },
        };
        const [rows, total] = await Promise.all([
            this.prisma.installmentSchedule.findMany({
                where,
                skip,
                take,
                include: {
                    installmentPlan: {
                        include: { saleInvoice: { select: { id: true, number: true, customerId: true } } },
                    },
                },
                orderBy: { dueDate: 'asc' },
            }),
            this.prisma.installmentSchedule.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((s) => ({
            ...this.formatSchedule(s),
            saleInvoice: s.installmentPlan.saleInvoice,
        })), total, page, pageSize);
    }
    async late(query) {
        const today = (0, date_range_1.startOfDayUtc)(new Date());
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = {
            dueDate: { lt: today },
            status: { in: ['PENDING', 'PARTIAL', 'LATE'] },
        };
        const [rows, total] = await Promise.all([
            this.prisma.installmentSchedule.findMany({
                where,
                skip,
                take,
                include: {
                    installmentPlan: {
                        include: { saleInvoice: { select: { id: true, number: true, customerId: true } } },
                    },
                },
                orderBy: { dueDate: 'asc' },
            }),
            this.prisma.installmentSchedule.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((s) => ({
            ...this.formatSchedule(s),
            saleInvoice: s.installmentPlan.saleInvoice,
            daysLate: Math.floor((today.getTime() - s.dueDate.getTime()) / (24 * 60 * 60 * 1000)),
        })), total, page, pageSize);
    }
    formatPlan(plan) {
        return {
            id: plan.id,
            saleInvoiceId: plan.saleInvoiceId,
            saleInvoice: plan.saleInvoice
                ? {
                    ...plan.saleInvoice,
                    total: plan.saleInvoice.total != null ? (0, pagination_1.decimalStr)(plan.saleInvoice.total) : undefined,
                    balance: plan.saleInvoice.balance != null ? (0, pagination_1.decimalStr)(plan.saleInvoice.balance) : undefined,
                }
                : undefined,
            totalAmount: (0, pagination_1.decimalStr)(plan.totalAmount),
            advanceAmount: (0, pagination_1.decimalStr)(plan.advanceAmount),
            remainingAmount: (0, pagination_1.decimalStr)(plan.remainingAmount),
            installmentAmount: (0, pagination_1.decimalStr)(plan.installmentAmount),
            installmentCount: plan.installmentCount,
            createdAt: plan.createdAt.toISOString(),
            schedules: plan.schedules?.map((s) => this.formatSchedule(s)),
        };
    }
    formatSchedule(schedule) {
        return {
            id: schedule.id,
            dueDate: schedule.dueDate.toISOString().slice(0, 10),
            amount: (0, pagination_1.decimalStr)(schedule.amount),
            paidAmount: (0, pagination_1.decimalStr)(schedule.paidAmount),
            remaining: (0, pagination_1.decimalStr)(schedule.amount.sub(schedule.paidAmount)),
            status: schedule.status,
            paidAt: schedule.paidAt?.toISOString() ?? null,
        };
    }
};
exports.InstallmentsService = InstallmentsService;
exports.InstallmentsService = InstallmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InstallmentsService);
//# sourceMappingURL=installments.service.js.map