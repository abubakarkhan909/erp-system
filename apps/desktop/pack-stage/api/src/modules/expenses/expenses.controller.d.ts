import { ExpensesService } from './expenses.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        categoryId: string;
        bankAccountId: string | null;
        reference: string | null;
        expenseDate: Date;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        attachmentId: string | null;
    }>;
    create(body: unknown, user: AuthUser): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
