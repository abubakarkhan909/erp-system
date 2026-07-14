import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
export declare class BanksService {
    private readonly prisma;
    private readonly accounting;
    constructor(prisma: PrismaService, accounting: AccountingService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            isActive: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            openingBalance: Prisma.Decimal;
            currentBalance: Prisma.Decimal;
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
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
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
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
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
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
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
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
        bankName: string;
        accountNo: string | null;
        iban: string | null;
        glAccountId: string | null;
    }>;
    deposit(id: string, body: unknown, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        createdById: string | null;
        amount: Prisma.Decimal;
        type: import("@prisma/client").$Enums.BankTxnType;
        memo: string | null;
        bankAccountId: string;
        reference: string | null;
        contraAccountId: string | null;
        txnDate: Date;
    }>;
    withdraw(id: string, body: unknown, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        createdById: string | null;
        amount: Prisma.Decimal;
        type: import("@prisma/client").$Enums.BankTxnType;
        memo: string | null;
        bankAccountId: string;
        reference: string | null;
        contraAccountId: string | null;
        txnDate: Date;
    }>;
    transfer(body: unknown, userId?: string): Promise<{
        outTxn: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            amount: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            type: import("@prisma/client").$Enums.BankTxnType;
            memo: string | null;
            bankAccountId: string;
            reference: string | null;
            contraAccountId: string | null;
            txnDate: Date;
        };
    }>;
    private recordTxn;
    private ensureAccount;
}
