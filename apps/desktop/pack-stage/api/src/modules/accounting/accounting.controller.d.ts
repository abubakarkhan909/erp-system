import { AccountingService, PostJournalInput } from './accounting.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
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
    postManualJournal(body: PostJournalInput, user: AuthUser): Promise<{
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
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
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
    trialBalance(from?: string, to?: string): Promise<{
        rows: {
            balance: string;
            code: string;
            name: string;
            type: import("@prisma/client").AccountType;
            debit: string;
            credit: string;
        }[];
        totalDebit: string;
        totalCredit: string;
    }>;
    profitAndLoss(from?: string, to?: string): Promise<{
        rows: {
            balance: string;
            code: string;
            name: string;
            type: import("@prisma/client").AccountType;
            debit: string;
            credit: string;
        }[];
        revenue: string;
        expenses: string;
        netProfit: string;
    }>;
    balanceSheet(asOf?: string): Promise<{
        asOf: string;
        rows: {
            balance: string;
            code: string;
            name: string;
            type: import("@prisma/client").AccountType;
            debit: string;
            credit: string;
        }[];
        assets: string;
        liabilities: string;
        equity: string;
    }>;
    cashFlow(from?: string, to?: string): Promise<{
        from: string | undefined;
        to: string | undefined;
        cashAccounts: {
            balance: string;
            code: string;
            name: string;
            type: import("@prisma/client").AccountType;
            debit: string;
            credit: string;
        }[];
        netCashChange: string;
    }>;
    closePeriod(body: {
        year: number;
        month: number;
    }, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        status: import("@prisma/client").$Enums.FiscalPeriodStatus;
        month: number;
        closedAt: Date | null;
        closedById: string | null;
    }>;
}
