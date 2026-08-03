import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';
export declare class UtilityBillsService {
    private readonly prisma;
    private readonly expensesService;
    constructor(prisma: PrismaService, expensesService: ExpensesService);
    findAll(query: Record<string, unknown>): Promise<{
        data: ({
            expense: {
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: Prisma.Decimal;
            notes: string | null;
            type: import("@prisma/client").$Enums.UtilityBillType;
            status: import("@prisma/client").$Enums.UtilityBillStatus;
            dueDate: Date;
            billNumber: string | null;
            paidDate: Date | null;
            expenseId: string | null;
        })[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<{
        expense: {
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        dueDate: Date;
        billNumber: string | null;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
    create(body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        dueDate: Date;
        billNumber: string | null;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
    update(id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        dueDate: Date;
        billNumber: string | null;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    markPaid(id: string, body: unknown, userId?: string): Promise<{
        expense: {
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        dueDate: Date;
        billNumber: string | null;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
}
