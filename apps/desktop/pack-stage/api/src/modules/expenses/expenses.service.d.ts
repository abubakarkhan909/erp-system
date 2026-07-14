import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { NumberSeriesService } from '../number-series/number-series.service';
export declare class ExpensesService {
    private readonly prisma;
    private readonly accounting;
    private readonly numberSeries;
    constructor(prisma: PrismaService, accounting: AccountingService, numberSeries: NumberSeriesService);
    listCategories(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }[]>;
    findAll(query: Record<string, unknown>): Promise<{
        data: ({
            category: {
                id: string;
                createdAt: Date;
                name: string;
                code: string;
            };
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            amount: Prisma.Decimal;
            notes: string | null;
            categoryId: string;
            bankAccountId: string | null;
            reference: string | null;
            expenseDate: Date;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            attachmentId: string | null;
        })[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            code: string;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        categoryId: string;
        bankAccountId: string | null;
        reference: string | null;
        expenseDate: Date;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        attachmentId: string | null;
    }>;
    create(body: unknown, userId?: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            code: string;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        categoryId: string;
        bankAccountId: string | null;
        reference: string | null;
        expenseDate: Date;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        attachmentId: string | null;
    }>;
    update(id: string, body: unknown): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            code: string;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        amount: Prisma.Decimal;
        notes: string | null;
        categoryId: string;
        bankAccountId: string | null;
        reference: string | null;
        expenseDate: Date;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        attachmentId: string | null;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
