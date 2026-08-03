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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const accounting_service_1 = require("../accounting/accounting.service");
const accounting_constants_1 = require("../accounting/accounting.constants");
const number_series_service_1 = require("../number-series/number-series.service");
const zod_validate_1 = require("../../common/utils/zod-validate");
const zod_1 = require("zod");
const customerPaymentSchema = zod_1.z.object({
    customerId: zod_1.z.string().cuid(),
    amount: shared_1.moneySchema,
    paymentDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    method: zod_1.z.nativeEnum(client_1.PaymentMethod).default(client_1.PaymentMethod.CASH),
    bankAccountId: zod_1.z.string().cuid().optional().nullable(),
    reference: zod_1.z.string().max(100).optional().nullable(),
    memo: zod_1.z.string().max(500).optional().nullable(),
});
const supplierPaymentSchema = zod_1.z.object({
    supplierId: zod_1.z.string().cuid(),
    amount: shared_1.moneySchema,
    paymentDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    method: zod_1.z.nativeEnum(client_1.PaymentMethod).default(client_1.PaymentMethod.CASH),
    bankAccountId: zod_1.z.string().cuid().optional().nullable(),
    reference: zod_1.z.string().max(100).optional().nullable(),
    memo: zod_1.z.string().max(500).optional().nullable(),
});
let PaymentsService = class PaymentsService {
    prisma;
    accounting;
    numberSeries;
    constructor(prisma, accounting, numberSeries) {
        this.prisma = prisma;
        this.accounting = accounting;
        this.numberSeries = numberSeries;
    }
    async recordCustomerPayment(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(customerPaymentSchema, body);
        const amount = (0, shared_1.roundMoney)(dto.amount);
        if (parseFloat(amount) <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        return this.prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findFirst({
                where: { id: dto.customerId, deletedAt: null },
            });
            if (!customer)
                throw new common_1.NotFoundException('Customer not found');
            const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
            const refNumber = await this.numberSeries.nextNumber('CUST_PAY', 'CP', tx);
            await tx.customer.update({
                where: { id: dto.customerId },
                data: { currentBalance: { decrement: amount } },
            });
            const assetAccount = dto.method === client_1.PaymentMethod.CASH ? accounting_constants_1.ACCOUNT_CODES.CASH : accounting_constants_1.ACCOUNT_CODES.BANK;
            if (dto.method !== client_1.PaymentMethod.CASH && dto.bankAccountId) {
                await tx.bankAccount.update({
                    where: { id: dto.bankAccountId },
                    data: { currentBalance: { increment: amount } },
                });
                await tx.bankTransaction.create({
                    data: {
                        bankAccountId: dto.bankAccountId,
                        type: 'DEPOSIT',
                        amount,
                        reference: dto.reference ?? refNumber,
                        memo: dto.memo ?? `Customer payment ${refNumber}`,
                        txnDate: paymentDate,
                        createdById: userId,
                    },
                });
            }
            else if (dto.method === client_1.PaymentMethod.CASH) {
                await this.recordCashTx(tx, 'IN', amount, 'CUSTOMER_PAYMENT', refNumber, userId);
            }
            const journal = await this.accounting.postJournal(tx, {
                entryDate: paymentDate,
                memo: dto.memo ?? `Customer payment ${refNumber}`,
                sourceType: 'CUSTOMER_PAYMENT',
                sourceId: dto.customerId,
                createdById: userId,
                lines: [
                    {
                        accountCode: assetAccount,
                        debit: amount,
                        credit: '0.000',
                    },
                    {
                        accountCode: accounting_constants_1.ACCOUNT_CODES.AR,
                        debit: '0.000',
                        credit: amount,
                        partyType: 'CUSTOMER',
                        partyId: dto.customerId,
                        narration: dto.reference ?? undefined,
                    },
                ],
            });
            return {
                reference: refNumber,
                customerId: dto.customerId,
                amount,
                method: dto.method,
                journalId: journal.id,
                journalNumber: journal.number,
            };
        });
    }
    async recordSupplierPayment(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(supplierPaymentSchema, body);
        const amount = (0, shared_1.roundMoney)(dto.amount);
        if (parseFloat(amount) <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        return this.prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.findFirst({
                where: { id: dto.supplierId, deletedAt: null },
            });
            if (!supplier)
                throw new common_1.NotFoundException('Supplier not found');
            const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
            const refNumber = await this.numberSeries.nextNumber('SUPP_PAY', 'SP', tx);
            await tx.supplier.update({
                where: { id: dto.supplierId },
                data: { currentBalance: { decrement: amount } },
            });
            const assetAccount = dto.method === client_1.PaymentMethod.CASH ? accounting_constants_1.ACCOUNT_CODES.CASH : accounting_constants_1.ACCOUNT_CODES.BANK;
            if (dto.method !== client_1.PaymentMethod.CASH && dto.bankAccountId) {
                await tx.bankAccount.update({
                    where: { id: dto.bankAccountId },
                    data: { currentBalance: { decrement: amount } },
                });
                await tx.bankTransaction.create({
                    data: {
                        bankAccountId: dto.bankAccountId,
                        type: 'WITHDRAW',
                        amount,
                        reference: dto.reference ?? refNumber,
                        memo: dto.memo ?? `Supplier payment ${refNumber}`,
                        txnDate: paymentDate,
                        createdById: userId,
                    },
                });
            }
            else if (dto.method === client_1.PaymentMethod.CASH) {
                await this.recordCashTx(tx, 'OUT', amount, 'SUPPLIER_PAYMENT', refNumber, userId);
            }
            const journal = await this.accounting.postJournal(tx, {
                entryDate: paymentDate,
                memo: dto.memo ?? `Supplier payment ${refNumber}`,
                sourceType: 'SUPPLIER_PAYMENT',
                sourceId: dto.supplierId,
                createdById: userId,
                lines: [
                    {
                        accountCode: accounting_constants_1.ACCOUNT_CODES.AP,
                        debit: amount,
                        credit: '0.000',
                        partyType: 'SUPPLIER',
                        partyId: dto.supplierId,
                        narration: dto.reference ?? undefined,
                    },
                    {
                        accountCode: assetAccount,
                        debit: '0.000',
                        credit: amount,
                    },
                ],
            });
            return {
                reference: refNumber,
                supplierId: dto.supplierId,
                amount,
                method: dto.method,
                journalId: journal.id,
                journalNumber: journal.number,
            };
        });
    }
    async recordCashTx(tx, type, amount, refType, refId, userId) {
        const openSession = await tx.cashSession.findFirst({
            where: { status: 'OPEN' },
            orderBy: { openedAt: 'desc' },
        });
        await tx.cashTransaction.create({
            data: {
                cashSessionId: openSession?.id ?? null,
                type,
                amount,
                reason: refType,
                refType,
                refId,
                createdById: userId,
            },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounting_service_1.AccountingService,
        number_series_service_1.NumberSeriesService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map