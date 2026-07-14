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
exports.BanksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const accounting_service_1 = require("../accounting/accounting.service");
const accounting_constants_1 = require("../accounting/accounting.constants");
const pagination_1 = require("../../common/utils/pagination");
const pagination_2 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
const zod_validate_1 = require("../../common/utils/zod-validate");
const zod_1 = require("zod");
const bankAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    bankName: zod_1.z.string().min(1).max(200),
    accountNo: zod_1.z.string().max(50).optional().nullable(),
    iban: zod_1.z.string().max(50).optional().nullable(),
    openingBalance: shared_1.moneySchema.default('0.000'),
    isActive: zod_1.z.boolean().default(true),
});
const txnSchema = zod_1.z.object({
    amount: shared_1.moneySchema,
    reference: zod_1.z.string().max(100).optional().nullable(),
    memo: zod_1.z.string().max(500).optional().nullable(),
    txnDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
});
const transferSchema = txnSchema.extend({
    fromAccountId: zod_1.z.string().cuid(),
    toAccountId: zod_1.z.string().cuid(),
});
let BanksService = class BanksService {
    prisma;
    accounting;
    constructor(prisma, accounting) {
        this.prisma = prisma;
        this.accounting = accounting;
    }
    async findAll(query) {
        const { page, pageSize, skip, take, search } = (0, pagination_2.parsePagination)(query);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { bankName: { contains: search } },
                { accountNo: { contains: search } },
            ];
        }
        const [rows, total] = await Promise.all([
            this.prisma.bankAccount.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
            this.prisma.bankAccount.count({ where }),
        ]);
        return (0, pagination_2.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async findOne(id) {
        const account = await this.prisma.bankAccount.findFirst({
            where: { id, deletedAt: null },
        });
        if (!account)
            throw new common_1.NotFoundException('Bank account not found');
        return (0, serialize_1.serializeRecord)(account);
    }
    async create(body) {
        const dto = (0, zod_validate_1.zodValidate)(bankAccountSchema, body);
        const opening = (0, shared_1.roundMoney)(dto.openingBalance ?? '0.000');
        const account = await this.prisma.bankAccount.create({
            data: {
                name: dto.name,
                bankName: dto.bankName,
                accountNo: dto.accountNo ?? null,
                iban: dto.iban ?? null,
                openingBalance: opening,
                currentBalance: opening,
                isActive: dto.isActive,
            },
        });
        return (0, serialize_1.serializeRecord)(account);
    }
    async update(id, body) {
        await this.findOne(id);
        const dto = (0, zod_validate_1.zodValidate)(bankAccountSchema.partial(), body);
        const account = await this.prisma.bankAccount.update({
            where: { id },
            data: {
                name: dto.name,
                bankName: dto.bankName,
                accountNo: dto.accountNo,
                iban: dto.iban,
                isActive: dto.isActive,
            },
        });
        return (0, serialize_1.serializeRecord)(account);
    }
    async remove(id) {
        await this.findOne(id);
        const account = await this.prisma.bankAccount.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return (0, serialize_1.serializeRecord)(account);
    }
    async deposit(id, body, userId) {
        return this.recordTxn(id, 'DEPOSIT', body, userId);
    }
    async withdraw(id, body, userId) {
        return this.recordTxn(id, 'WITHDRAW', body, userId);
    }
    async transfer(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(transferSchema, body);
        if (dto.fromAccountId === dto.toAccountId) {
            throw new common_1.BadRequestException('Cannot transfer to the same account');
        }
        const amount = (0, shared_1.roundMoney)(dto.amount);
        const txnDate = dto.txnDate ? new Date(dto.txnDate) : new Date();
        return this.prisma.$transaction(async (tx) => {
            await this.ensureAccount(tx, dto.fromAccountId);
            await this.ensureAccount(tx, dto.toAccountId);
            const fromBal = await tx.bankAccount.findUnique({ where: { id: dto.fromAccountId } });
            if (parseFloat((0, pagination_1.decimalStr)(fromBal.currentBalance)) < parseFloat(amount)) {
                throw new common_1.BadRequestException('Insufficient bank balance');
            }
            await tx.bankAccount.update({
                where: { id: dto.fromAccountId },
                data: { currentBalance: { decrement: amount } },
            });
            await tx.bankAccount.update({
                where: { id: dto.toAccountId },
                data: { currentBalance: { increment: amount } },
            });
            const outTxn = await tx.bankTransaction.create({
                data: {
                    bankAccountId: dto.fromAccountId,
                    type: client_1.BankTxnType.TRANSFER,
                    amount,
                    contraAccountId: dto.toAccountId,
                    reference: dto.reference ?? null,
                    memo: dto.memo ?? 'Bank transfer out',
                    txnDate,
                    createdById: userId,
                },
            });
            const inTxn = await tx.bankTransaction.create({
                data: {
                    bankAccountId: dto.toAccountId,
                    type: client_1.BankTxnType.TRANSFER,
                    amount,
                    contraAccountId: dto.fromAccountId,
                    reference: dto.reference ?? null,
                    memo: dto.memo ?? 'Bank transfer in',
                    txnDate,
                    createdById: userId,
                },
            });
            await this.accounting.postJournal(tx, {
                entryDate: txnDate,
                memo: dto.memo ?? 'Bank transfer',
                sourceType: 'BANK_TRANSFER',
                sourceId: outTxn.id,
                createdById: userId,
                lines: [
                    { accountCode: accounting_constants_1.ACCOUNT_CODES.BANK, debit: amount, credit: '0.000' },
                    { accountCode: accounting_constants_1.ACCOUNT_CODES.BANK, debit: '0.000', credit: amount },
                ],
            });
            return { outTxn: (0, serialize_1.serializeRecord)(outTxn), inTxn: (0, serialize_1.serializeRecord)(inTxn) };
        });
    }
    async recordTxn(bankAccountId, type, body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(txnSchema, body);
        const amount = (0, shared_1.roundMoney)(dto.amount);
        const txnDate = dto.txnDate ? new Date(dto.txnDate) : new Date();
        return this.prisma.$transaction(async (tx) => {
            await this.ensureAccount(tx, bankAccountId);
            if (type === client_1.BankTxnType.WITHDRAW) {
                const acct = await tx.bankAccount.findUnique({ where: { id: bankAccountId } });
                if (parseFloat((0, pagination_1.decimalStr)(acct.currentBalance)) < parseFloat(amount)) {
                    throw new common_1.BadRequestException('Insufficient bank balance');
                }
                await tx.bankAccount.update({
                    where: { id: bankAccountId },
                    data: { currentBalance: { decrement: amount } },
                });
            }
            else {
                await tx.bankAccount.update({
                    where: { id: bankAccountId },
                    data: { currentBalance: { increment: amount } },
                });
            }
            const bankTxn = await tx.bankTransaction.create({
                data: {
                    bankAccountId,
                    type,
                    amount,
                    reference: dto.reference ?? null,
                    memo: dto.memo ?? null,
                    txnDate,
                    createdById: userId,
                },
            });
            const lines = type === client_1.BankTxnType.DEPOSIT
                ? [
                    { accountCode: accounting_constants_1.ACCOUNT_CODES.BANK, debit: amount, credit: '0.000' },
                    { accountCode: accounting_constants_1.ACCOUNT_CODES.CASH, debit: '0.000', credit: amount },
                ]
                : [
                    { accountCode: accounting_constants_1.ACCOUNT_CODES.CASH, debit: amount, credit: '0.000' },
                    { accountCode: accounting_constants_1.ACCOUNT_CODES.BANK, debit: '0.000', credit: amount },
                ];
            await this.accounting.postJournal(tx, {
                entryDate: txnDate,
                memo: dto.memo ?? `Bank ${type.toLowerCase()}`,
                sourceType: `BANK_${type}`,
                sourceId: bankTxn.id,
                createdById: userId,
                lines,
            });
            return (0, serialize_1.serializeRecord)(bankTxn);
        });
    }
    async ensureAccount(tx, id) {
        const account = await tx.bankAccount.findFirst({ where: { id, deletedAt: null } });
        if (!account)
            throw new common_1.NotFoundException('Bank account not found');
        return account;
    }
};
exports.BanksService = BanksService;
exports.BanksService = BanksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService])
], BanksService);
//# sourceMappingURL=banks.service.js.map