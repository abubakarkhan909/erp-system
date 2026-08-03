import { CustomersService } from './customers.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            email: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            updatedById: string | null;
            name: string;
            address: string | null;
            phone: string | null;
            openingBalance: import("@prisma/client/runtime/library").Decimal;
            currentBalance: import("@prisma/client/runtime/library").Decimal;
            civilId: string | null;
            notes: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getLedger(id: string): Promise<{
        customerId: string;
        currentBalance: string;
        openingBalance: string;
        sales: {
            count: number;
            total: string;
            paid: string;
            balance: string;
        };
        payments: {
            count: number;
            total: string;
        };
        recentSales: {
            total: string;
            paid: string;
            balance: string;
            number: string;
            id: string;
            status: import("@prisma/client").$Enums.DocumentStatus;
            invoiceDate: Date;
        }[];
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        civilId: string | null;
        notes: string | null;
    }>;
    create(body: unknown, user: AuthUser): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        civilId: string | null;
        notes: string | null;
    }>;
    update(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        civilId: string | null;
        notes: string | null;
    }>;
    remove(id: string, user: AuthUser): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        civilId: string | null;
        notes: string | null;
    }>;
}
