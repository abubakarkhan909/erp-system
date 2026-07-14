import { UtilityBillsService } from './utility-bills.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class UtilityBillsController {
    private readonly utilityBillsService;
    constructor(utilityBillsService: UtilityBillsService);
    findAll(query: Record<string, unknown>): Promise<{
        data: ({
            expense: {
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            type: import("@prisma/client").$Enums.UtilityBillType;
            status: import("@prisma/client").$Enums.UtilityBillStatus;
            billNumber: string | null;
            dueDate: Date;
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        billNumber: string | null;
        dueDate: Date;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
    create(body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        billNumber: string | null;
        dueDate: Date;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
    update(id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        billNumber: string | null;
        dueDate: Date;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    markPaid(id: string, body: unknown, user: AuthUser): Promise<{
        expense: {
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        type: import("@prisma/client").$Enums.UtilityBillType;
        status: import("@prisma/client").$Enums.UtilityBillStatus;
        billNumber: string | null;
        dueDate: Date;
        paidDate: Date | null;
        expenseId: string | null;
    }>;
}
