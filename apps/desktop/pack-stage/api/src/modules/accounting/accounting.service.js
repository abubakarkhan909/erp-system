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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const number_series_service_1 = require("../number-series/number-series.service");
const pagination_1 = require("../../common/utils/pagination");
const accounting_constants_1 = require("./accounting.constants");
let AccountingService = class AccountingService {
    prisma;
    numberSeries;
    constructor(prisma, numberSeries) {
        this.prisma = prisma;
        this.numberSeries = numberSeries;
    }
    async resolveAccountByCode(code, tx) {
        const db = tx ?? this.prisma;
        const account = await db.account.findUnique({ where: { code } });
        if (!account) {
            throw new common_1.NotFoundException(`Account ${code} not found`);
        }
        return account;
    }
    async ensurePeriodOpen(date, tx) {
        const entryDate = this.toDate(date);
        const year = entryDate.getFullYear();
        const month = entryDate.getMonth() + 1;
        const db = tx ?? this.prisma;
        let period = await db.fiscalPeriod.findUnique({
            where: { year_month: { year, month } },
        });
        if (!period) {
            period = await db.fiscalPeriod.create({
                data: { year, month, status: client_1.FiscalPeriodStatus.OPEN },
            });
        }
        if (period.status === client_1.FiscalPeriodStatus.CLOSED) {
            throw new common_1.BadRequestException(`Fiscal period ${year}-${String(month).padStart(2, '0')} is closed`);
        }
        return period;
    }
    async postJournal(tx, input) {
        const entryDate = this.toDate(input.entryDate);
        const period = await this.ensurePeriodOpen(entryDate, tx);
        let totalDebit = '0.000';
        let totalCredit = '0.000';
        for (const line of input.lines) {
            totalDebit = (0, shared_1.addMoney)(totalDebit, line.debit ?? '0.000');
            totalCredit = (0, shared_1.addMoney)(totalCredit, line.credit ?? '0.000');
        }
        if ((0, shared_1.roundMoney)(totalDebit) !== (0, shared_1.roundMoney)(totalCredit)) {
            throw new common_1.BadRequestException(`Journal not balanced: debit ${totalDebit} != credit ${totalCredit}`);
        }
        if (input.lines.length === 0) {
            throw new common_1.BadRequestException('Journal must have at least one line');
        }
        const number = await this.numberSeries.nextNumber('JRN', 'JRN', tx);
        const entry = await tx.journalEntry.create({
            data: {
                number,
                entryDate,
                memo: input.memo ?? null,
                sourceType: input.sourceType ?? null,
                sourceId: input.sourceId ?? null,
                periodId: period.id,
                createdById: input.createdById ?? null,
                lines: {
                    create: await Promise.all(input.lines.map(async (line) => {
                        const account = await this.resolveAccountByCode(line.accountCode, tx);
                        return {
                            accountId: account.id,
                            debit: (0, shared_1.roundMoney)(line.debit ?? '0.000'),
                            credit: (0, shared_1.roundMoney)(line.credit ?? '0.000'),
                            partyType: line.partyType ?? null,
                            partyId: line.partyId ?? null,
                            narration: line.narration ?? null,
                        };
                    })),
                },
            },
            include: { lines: { include: { account: true } } },
        });
        return entry;
    }
    async reverseJournal(tx, journalEntryId, createdById, memo) {
        const original = await tx.journalEntry.findUnique({
            where: { id: journalEntryId },
            include: { lines: { include: { account: true } } },
        });
        if (!original) {
            throw new common_1.NotFoundException('Journal entry not found');
        }
        if (original.status === client_1.JournalStatus.REVERSED) {
            throw new common_1.BadRequestException('Journal already reversed');
        }
        const reversal = await this.postJournal(tx, {
            entryDate: original.entryDate,
            memo: memo ?? `Reversal of ${original.number}`,
            sourceType: 'JOURNAL_REVERSAL',
            sourceId: original.id,
            createdById,
            lines: original.lines.map((line) => ({
                accountCode: line.account.code,
                debit: (0, pagination_1.decimalStr)(line.credit),
                credit: (0, pagination_1.decimalStr)(line.debit),
                partyType: line.partyType ?? undefined,
                partyId: line.partyId ?? undefined,
                narration: line.narration ? `Reversal: ${line.narration}` : undefined,
            })),
        });
        await tx.journalEntry.update({
            where: { id: original.id },
            data: { status: client_1.JournalStatus.REVERSED },
        });
        return reversal;
    }
    async reverseJournalBySource(tx, sourceType, sourceId, createdById) {
        const original = await tx.journalEntry.findFirst({
            where: { sourceType, sourceId, status: client_1.JournalStatus.POSTED },
            include: { lines: { include: { account: true } } },
            orderBy: { createdAt: 'desc' },
        });
        if (!original) {
            return null;
        }
        return this.reverseJournal(tx, original.id, createdById, `Reversal of ${sourceType} ${sourceId}`);
    }
    async getChartOfAccounts() {
        const accounts = await this.prisma.account.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' },
        });
        return accounts;
    }
    async aggregateByAccount(from, to, accountTypes) {
        const where = {
            journalEntry: {
                status: client_1.JournalStatus.POSTED,
                ...(from || to
                    ? {
                        entryDate: {
                            ...(from ? { gte: from } : {}),
                            ...(to ? { lte: to } : {}),
                        },
                    }
                    : {}),
            },
            ...(accountTypes?.length
                ? { account: { type: { in: accountTypes } } }
                : {}),
        };
        const lines = await this.prisma.journalLine.findMany({
            where,
            include: { account: true },
        });
        const map = new Map();
        for (const line of lines) {
            const key = line.accountId;
            const existing = map.get(key) ?? {
                code: line.account.code,
                name: line.account.name,
                type: line.account.type,
                debit: '0.000',
                credit: '0.000',
            };
            existing.debit = (0, shared_1.addMoney)(existing.debit, (0, pagination_1.decimalStr)(line.debit));
            existing.credit = (0, shared_1.addMoney)(existing.credit, (0, pagination_1.decimalStr)(line.credit));
            map.set(key, existing);
        }
        return [...map.values()].map((row) => ({
            ...row,
            balance: (0, shared_1.subMoney)(row.debit, row.credit),
        }));
    }
    async getTrialBalance(from, to) {
        const fromDate = from ? this.toDate(from) : undefined;
        const toDate = to ? this.toDate(to) : undefined;
        const rows = await this.aggregateByAccount(fromDate, toDate);
        const totalDebit = rows.reduce((s, r) => (0, shared_1.addMoney)(s, r.debit), '0.000');
        const totalCredit = rows.reduce((s, r) => (0, shared_1.addMoney)(s, r.credit), '0.000');
        return { rows, totalDebit, totalCredit };
    }
    async getProfitAndLoss(from, to) {
        const fromDate = from ? this.toDate(from) : undefined;
        const toDate = to ? this.toDate(to) : undefined;
        const rows = await this.aggregateByAccount(fromDate, toDate, [
            client_1.AccountType.REVENUE,
            client_1.AccountType.EXPENSE,
        ]);
        let revenue = '0.000';
        let expenses = '0.000';
        for (const row of rows) {
            const net = (0, shared_1.subMoney)(row.credit, row.debit);
            if (row.type === client_1.AccountType.REVENUE) {
                revenue = (0, shared_1.addMoney)(revenue, net);
            }
            else {
                expenses = (0, shared_1.addMoney)(expenses, (0, shared_1.subMoney)(row.debit, row.credit));
            }
        }
        return {
            rows,
            revenue: (0, shared_1.roundMoney)(revenue),
            expenses: (0, shared_1.roundMoney)(expenses),
            netProfit: (0, shared_1.roundMoney)((0, shared_1.subMoney)(revenue, expenses)),
        };
    }
    async getBalanceSheet(asOf) {
        const toDate = asOf ? this.toDate(asOf) : new Date();
        const rows = await this.aggregateByAccount(undefined, toDate, [
            client_1.AccountType.ASSET,
            client_1.AccountType.LIABILITY,
            client_1.AccountType.EQUITY,
        ]);
        let assets = '0.000';
        let liabilities = '0.000';
        let equity = '0.000';
        for (const row of rows) {
            const balance = (0, shared_1.subMoney)(row.debit, row.credit);
            if (row.type === client_1.AccountType.ASSET) {
                assets = (0, shared_1.addMoney)(assets, balance);
            }
            else if (row.type === client_1.AccountType.LIABILITY) {
                liabilities = (0, shared_1.addMoney)(liabilities, (0, shared_1.subMoney)(row.credit, row.debit));
            }
            else {
                equity = (0, shared_1.addMoney)(equity, (0, shared_1.subMoney)(row.credit, row.debit));
            }
        }
        return {
            asOf: toDate.toISOString().slice(0, 10),
            rows,
            assets: (0, shared_1.roundMoney)(assets),
            liabilities: (0, shared_1.roundMoney)(liabilities),
            equity: (0, shared_1.roundMoney)(equity),
        };
    }
    async getCashFlow(from, to) {
        const fromDate = from ? this.toDate(from) : undefined;
        const toDate = to ? this.toDate(to) : undefined;
        const rows = await this.aggregateByAccount(fromDate, toDate, [client_1.AccountType.ASSET]);
        const cashCodes = [accounting_constants_1.ACCOUNT_CODES.CASH, accounting_constants_1.ACCOUNT_CODES.BANK];
        const cashRows = rows.filter((r) => cashCodes.includes(r.code));
        const netCash = cashRows.reduce((s, r) => (0, shared_1.addMoney)(s, (0, shared_1.subMoney)(r.debit, r.credit)), '0.000');
        return {
            from: fromDate?.toISOString().slice(0, 10),
            to: toDate?.toISOString().slice(0, 10),
            cashAccounts: cashRows,
            netCashChange: (0, shared_1.roundMoney)(netCash),
        };
    }
    async closePeriod(year, month, closedById) {
        const period = await this.prisma.fiscalPeriod.findUnique({
            where: { year_month: { year, month } },
        });
        if (!period) {
            throw new common_1.NotFoundException('Fiscal period not found');
        }
        if (period.status === client_1.FiscalPeriodStatus.CLOSED) {
            throw new common_1.BadRequestException('Period already closed');
        }
        return this.prisma.fiscalPeriod.update({
            where: { id: period.id },
            data: {
                status: client_1.FiscalPeriodStatus.CLOSED,
                closedAt: new Date(),
                closedById: closedById ?? null,
            },
        });
    }
    async postManualJournal(body, userId) {
        return this.prisma.$transaction((tx) => this.postJournal(tx, { ...body, createdById: userId }));
    }
    toDate(value) {
        if (value instanceof Date) {
            return value;
        }
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
            throw new common_1.BadRequestException('Invalid date');
        }
        return d;
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        number_series_service_1.NumberSeriesService])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map