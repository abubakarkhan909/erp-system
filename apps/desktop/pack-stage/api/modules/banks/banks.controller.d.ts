import { BanksService } from './banks.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class BanksController {
    private readonly banksService;
    constructor(banksService: BanksService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            isActive: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            openingBalance: import("@prisma/client/runtime/library").Decimal;
            currentBalance: import("@prisma/client/runtime/library").Decimal;
            bankName: string;
            accountNo: string | null;
            iban: string | null;
            glAccountId: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    transfer(body: unknown, user: AuthUser): Promise<{
        outTxn: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import("@prisma/client").$Enums.BankTxnType;
            memo: string | null;
            bankAccountId: string;
            reference: string | null;
            contraAccountId: string | null;
            txnDate: Date;
        };
        inTxn: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import("@prisma/client").$Enums.BankTxnType;
            memo: string | null;
            bankAccountId: string;
            reference: string | null;
            contraAccountId: string | null;
            txnDate: Date;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        bankName: string;
        accountNo: string | null;
        iban: string | null;
        glAccountId: string | null;
    }>;
    create(body: unknown): Promise<{
        id: string;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        bankName: string;
        accountNo: string | null;
        iban: string | null;
        glAccountId: string | null;
    }>;
    update(id: string, body: unknown): Promise<{
        id: string;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        bankName: string;
        accountNo: string | null;
        iban: string | null;
        glAccountId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        bankName: string;
        accountNo: string | null;
        iban: string | null;
        glAccountId: string | null;
    }>;
    deposit(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        createdById: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: import("@prisma/client").$Enums.BankTxnType;
        memo: string | null;
        bankAccountId: string;
        reference: string | null;
        contraAccountId: string | null;
        txnDate: Date;
    }>;
    withdraw(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        createdById: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: import("@prisma/client").$Enums.BankTxnType;
        memo: string | null;
        bankAccountId: string;
        reference: string | null;
        contraAccountId: string | null;
        txnDate: Date;
    }>;
}
