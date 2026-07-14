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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const accounting_service_1 = require("../accounting/accounting.service");
const accounting_constants_1 = require("../accounting/accounting.constants");
const number_series_service_1 = require("../number-series/number-series.service");
const pagination_1 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
const zod_validate_1 = require("../../common/utils/zod-validate");
const zod_1 = require("zod");
const expenseSchema = zod_1.z.object({
    expenseDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    categoryId: zod_1.z.string().cuid(),
    amount: shared_1.moneySchema,
    paymentMethod: zod_1.z.nativeEnum(client_1.PaymentMethod).default(client_1.PaymentMethod.CASH),
    bankAccountId: zod_1.z.string().cuid().optional().nullable(),
    reference: zod_1.z.string().max(100).optional().nullable(),
    notes: zod_1.z.string().max(2000).optional().nullable(),
});
let ExpensesService = class ExpensesService {
    prisma;
    accounting;
    numberSeries;
    constructor(prisma, accounting, numberSeries) {
        this.prisma = prisma;
        this.accounting = accounting;
        this.numberSeries = numberSeries;
    }
    async listCategories() {
        const categories = await this.prisma.expenseCategory.findMany({
            orderBy: { name: 'asc' },
        });
        return categories;
    }
    async findAll(query) {
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = {};
        if (query.categoryId)
            where.categoryId = String(query.categoryId);
        const [rows, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take,
                orderBy: { expenseDate: 'desc' },
                include: { category: true },
            }),
            this.prisma.expense.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async findOne(id) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        return (0, serialize_1.serializeRecord)(expense);
    }
    async create(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(expenseSchema, body);
        const amount = (0, shared_1.roundMoney)(dto.amount);
        const expenseDate = dto.expenseDate ? new Date(dto.expenseDate) : new Date();
        return this.prisma.$transaction(async (tx) => {
            const category = await tx.expenseCategory.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category)
                throw new common_1.NotFoundException('Expense category not found');
            const number = await this.numberSeries.nextNumber('EXPENSE', 'EXP', tx);
            const expense = await tx.expense.create({
                data: {
                    number,
                    expenseDate,
                    categoryId: dto.categoryId,
                    amount,
                    paymentMethod: dto.paymentMethod ?? client_1.PaymentMethod.CASH,
                    bankAccountId: dto.bankAccountId ?? null,
                    reference: dto.reference ?? null,
                    notes: dto.notes ?? null,
                    createdById: userId,
                },
                include: { category: true },
            });
            const assetAccount = dto.paymentMethod === client_1.PaymentMethod.CASH
                ? accounting_constants_1.ACCOUNT_CODES.CASH
                : accounting_constants_1.ACCOUNT_CODES.BANK;
            if (dto.paymentMethod !== client_1.PaymentMethod.CASH && dto.bankAccountId) {
                await tx.bankAccount.update({
                    where: { id: dto.bankAccountId },
                    data: { currentBalance: { decrement: amount } },
                });
                await tx.bankTransaction.create({
                    data: {
                        bankAccountId: dto.bankAccountId,
                        type: 'WITHDRAW',
                        amount,
                        reference: number,
                        memo: `Expense ${number}`,
                        txnDate: expenseDate,
                        createdById: userId,
                    },
                });
            }
            else if (dto.paymentMethod === client_1.PaymentMethod.CASH) {
                const openSession = await tx.cashSession.findFirst({
                    where: { status: 'OPEN' },
                    orderBy: { openedAt: 'desc' },
                });
                await tx.cashTransaction.create({
                    data: {
                        cashSessionId: openSession?.id ?? null,
                        type: 'OUT',
                        amount,
                        reason: 'EXPENSE',
                        refType: 'EXPENSE',
                        refId: expense.id,
                        createdById: userId,
                    },
                });
            }
            await this.accounting.postJournal(tx, {
                entryDate: expenseDate,
                memo: `Expense ${number} - ${category.name}`,
                sourceType: 'EXPENSE',
                sourceId: expense.id,
                createdById: userId,
                lines: [
                    {
                        accountCode: accounting_constants_1.ACCOUNT_CODES.EXPENSES,
                        debit: amount,
                        credit: '0.000',
                        narration: category.name,
                    },
                    {
                        accountCode: assetAccount,
                        debit: '0.000',
                        credit: amount,
                    },
                ],
            });
            return (0, serialize_1.serializeRecord)(expense);
        });
    }
    async update(id, body) {
        await this.findOne(id);
        const dto = (0, zod_validate_1.zodValidate)(expenseSchema.partial(), body);
        const expense = await this.prisma.expense.update({
            where: { id },
            data: {
                expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
                categoryId: dto.categoryId,
                amount: dto.amount ? (0, shared_1.roundMoney)(dto.amount) : undefined,
                paymentMethod: dto.paymentMethod,
                bankAccountId: dto.bankAccountId,
                reference: dto.reference,
                notes: dto.notes,
            },
            include: { category: true },
        });
        return (0, serialize_1.serializeRecord)(expense);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.expense.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService,
        number_series_service_1.NumberSeriesService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map