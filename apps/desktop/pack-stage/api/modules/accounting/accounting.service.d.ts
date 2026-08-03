import { AccountType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
export type JournalLineInput = {
    accountCode: string;
    debit: string;
    credit: string;
    partyType?: 'CUSTOMER' | 'SUPPLIER';
    partyId?: string;
    narration?: string;
};
export type PostJournalInput = {
    entryDate: Date | string;
    memo?: string;
    sourceType?: string;
    sourceId?: string;
    lines: JournalLineInput[];
    createdById?: string;
};
export declare class AccountingService {
    private readonly prisma;
    private readonly numberSeries;
    constructor(prisma: PrismaService, numberSeries: NumberSeriesService);
    resolveAccountByCode(code: string, tx?: Prisma.TransactionClient): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        type: import("@prisma/client").$Enums.AccountType;
        parentId: string | null;
        isSystem: boolean;
        isCashBook: boolean;
        isBankBook: boolean;
    }>;
    ensurePeriodOpen(date: Date | string, tx?: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        status: import("@prisma/client").$Enums.FiscalPeriodStatus;
        month: number;
        closedAt: Date | null;
        closedById: string | null;
    }>;
    postJournal(tx: Prisma.TransactionClient, input: PostJournalInput): Promise<{
        lines: ({
            account: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                type: import("@prisma/client").$Enums.AccountType;
                parentId: string | null;
                isSystem: boolean;
                isCashBook: boolean;
                isBankBook: boolean;
            };
        } & {
            id: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            partyType: import("@prisma/client").$Enums.PartyType | null;
            partyId: string | null;
            narration: string | null;
            accountId: string;
            journalEntryId: string;
        })[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        createdById: string | null;
        status: import("@prisma/client").$Enums.JournalStatus;
        entryDate: Date;
        memo: string | null;
        sourceType: string | null;
        sourceId: string | null;
        periodId: string | null;
    }>;
    reverseJournal(tx: Prisma.TransactionClient, journalEntryId: string, createdById?: string, memo?: string): Promise<{
        lines: ({
            account: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                type: import("@prisma/client").$Enums.AccountType;
                parentId: string | null;
                isSystem: boolean;
                isCashBook: boolean;
                isBankBook: boolean;
            };
        } & {
            id: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            partyType: import("@prisma/client").$Enums.PartyType | null;
            partyId: string | null;
            narration: string | null;
            accountId: string;
            journalEntryId: string;
        })[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        createdById: string | null;
        status: import("@prisma/client").$Enums.JournalStatus;
        entryDate: Date;
        memo: string | null;
        sourceType: string | null;
        sourceId: string | null;
        periodId: string | null;
    }>;
    reverseJournalBySource(tx: Prisma.TransactionClient, sourceType: string, sourceId: string, createdById?: string): Promise<({
        lines: ({
            account: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                type: import("@prisma/client").$Enums.AccountType;
                parentId: string | null;
                isSystem: boolean;
                isCashBook: boolean;
                isBankBook: boolean;
            };
        } & {
            id: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            partyType: import("@prisma/client").$Enums.PartyType | null;
            partyId: string | null;
            narration: string | null;
            accountId: string;
            journalEntryId: string;
        })[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        createdById: string | null;
        status: import("@prisma/client").$Enums.JournalStatus;
        entryDate: Date;
        memo: string | null;
        sourceType: string | null;
        sourceId: string | null;
        periodId: string | null;
    }) | null>;
    getChartOfAccounts(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        type: import("@prisma/client").$Enums.AccountType;
        parentId: string | null;
        isSystem: boolean;
        isCashBook: boolean;
        isBankBook: boolean;
    }[]>;
    private aggregateByAccount;
    getTrialBalance(from?: string, to?: string): Promise<{
        rows: {
            balance: string;
            code: string;
            name: string;
            type: AccountType;
            debit: string;
            credit: string;
        }[];
        totalDebit: string;
        totalCredit: string;
    }>;
    getProfitAndLoss(from?: string, to?: string): Promise<{
        rows: {
            balance: string;
            code: string;
            name: string;
            type: AccountType;
            debit: string;
            credit: string;
        }[];
        revenue: string;
        expenses: string;
        netProfit: string;
    }>;
    getBalanceSheet(asOf?: string): Promise<{
        asOf: string;
        rows: {
            balance: string;
            code: string;
            name: string;
            type: AccountType;
            debit: string;
            credit: string;
        }[];
        assets: string;
        liabilities: string;
        equity: string;
    }>;
    getCashFlow(from?: string, to?: string): Promise<{
        from: string | undefined;
        to: string | undefined;
        cashAccounts: {
            balance: string;
            code: string;
            name: string;
            type: AccountType;
            debit: string;
            credit: string;
        }[];
        netCashChange: string;
    }>;
    closePeriod(year: number, month: number, closedById?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        status: import("@prisma/client").$Enums.FiscalPeriodStatus;
        month: number;
        closedAt: Date | null;
        closedById: string | null;
    }>;
    postManualJournal(body: PostJournalInput, userId?: string): Promise<{
        lines: ({
            account: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                type: import("@prisma/client").$Enums.AccountType;
                parentId: string | null;
                isSystem: boolean;
                isCashBook: boolean;
                isBankBook: boolean;
            };
        } & {
            id: string;
            debit: Prisma.Decimal;
            credit: Prisma.Decimal;
            partyType: import("@prisma/client").$Enums.PartyType | null;
            partyId: string | null;
            narration: string | null;
            accountId: string;
            journalEntryId: string;
        })[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        createdById: string | null;
        status: import("@prisma/client").$Enums.JournalStatus;
        entryDate: Date;
        memo: string | null;
        sourceType: string | null;
        sourceId: string | null;
        periodId: string | null;
    }>;
    private toDate;
}
