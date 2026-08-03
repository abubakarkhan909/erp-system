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
exports.UtilityBillsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const expenses_service_1 = require("../expenses/expenses.service");
const pagination_1 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
const zod_validate_1 = require("../../common/utils/zod-validate");
const zod_1 = require("zod");
const utilityBillSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(client_1.UtilityBillType),
    billNumber: zod_1.z.string().max(100).optional().nullable(),
    dueDate: zod_1.z.string().or(zod_1.z.coerce.date()),
    amount: shared_1.moneySchema,
    notes: zod_1.z.string().max(500).optional().nullable(),
});
const markPaidSchema = zod_1.z.object({
    paidDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    createExpense: zod_1.z.boolean().default(false),
    categoryId: zod_1.z.string().cuid().optional(),
    paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'MIXED']).optional(),
    bankAccountId: zod_1.z.string().cuid().optional().nullable(),
});
let UtilityBillsService = class UtilityBillsService {
    prisma;
    expensesService;
    constructor(prisma, expensesService) {
        this.prisma = prisma;
        this.expensesService = expensesService;
    }
    async findAll(query) {
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.type)
            where.type = query.type;
        const [rows, total] = await Promise.all([
            this.prisma.utilityBill.findMany({
                where,
                skip,
                take,
                orderBy: { dueDate: 'asc' },
                include: { expense: true },
            }),
            this.prisma.utilityBill.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async findOne(id) {
        const bill = await this.prisma.utilityBill.findUnique({
            where: { id },
            include: { expense: true },
        });
        if (!bill)
            throw new common_1.NotFoundException('Utility bill not found');
        return (0, serialize_1.serializeRecord)(bill);
    }
    async create(body) {
        const dto = (0, zod_validate_1.zodValidate)(utilityBillSchema, body);
        const bill = await this.prisma.utilityBill.create({
            data: {
                type: dto.type,
                billNumber: dto.billNumber ?? null,
                dueDate: new Date(dto.dueDate),
                amount: (0, shared_1.roundMoney)(dto.amount),
                status: client_1.UtilityBillStatus.PENDING,
                notes: dto.notes ?? null,
            },
        });
        return (0, serialize_1.serializeRecord)(bill);
    }
    async update(id, body) {
        await this.findOne(id);
        const dto = (0, zod_validate_1.zodValidate)(utilityBillSchema.partial(), body);
        const bill = await this.prisma.utilityBill.update({
            where: { id },
            data: {
                type: dto.type,
                billNumber: dto.billNumber,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                amount: dto.amount ? (0, shared_1.roundMoney)(dto.amount) : undefined,
                notes: dto.notes,
            },
        });
        return (0, serialize_1.serializeRecord)(bill);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.utilityBill.delete({ where: { id } });
        return { deleted: true };
    }
    async markPaid(id, body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(markPaidSchema, body);
        const bill = await this.prisma.utilityBill.findUnique({ where: { id } });
        if (!bill)
            throw new common_1.NotFoundException('Utility bill not found');
        if (bill.status === client_1.UtilityBillStatus.PAID) {
            return this.findOne(id);
        }
        let expenseId = null;
        const amount = (0, shared_1.roundMoney)(bill.amount.toString());
        if (dto.createExpense) {
            if (!dto.categoryId) {
                throw new common_1.NotFoundException('categoryId required when createExpense is true');
            }
            const expense = await this.expensesService.create({
                expenseDate: dto.paidDate ?? new Date(),
                categoryId: dto.categoryId,
                amount,
                paymentMethod: dto.paymentMethod ?? 'CASH',
                bankAccountId: dto.bankAccountId,
                reference: bill.billNumber,
                notes: `Utility bill ${bill.type}`,
            }, userId);
            expenseId = expense.id;
        }
        const updated = await this.prisma.utilityBill.update({
            where: { id },
            data: {
                status: client_1.UtilityBillStatus.PAID,
                paidDate: dto.paidDate ? new Date(dto.paidDate) : new Date(),
                expenseId,
            },
            include: { expense: true },
        });
        return (0, serialize_1.serializeRecord)(updated);
    }
};
exports.UtilityBillsService = UtilityBillsService;
exports.UtilityBillsService = UtilityBillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        expenses_service_1.ExpensesService])
], UtilityBillsService);
//# sourceMappingURL=utility-bills.service.js.map