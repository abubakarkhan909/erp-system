import { SuppliersService } from './suppliers.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
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
            notes: string | null;
            tradeLicense: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getLedger(id: string): Promise<{
        supplierId: string;
        currentBalance: string;
        openingBalance: string;
        purchases: {
            count: number;
            total: string;
            paid: string;
            balance: string;
        };
        payments: {
            count: number;
            total: string;
        };
        recentPurchases: {
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
        notes: string | null;
        tradeLicense: string | null;
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
        notes: string | null;
        tradeLicense: string | null;
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
        notes: string | null;
        tradeLicense: string | null;
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
        notes: string | null;
        tradeLicense: string | null;
    }>;
}
