import { PurchasesService } from './purchases.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    findAll(query: Record<string, unknown>): Promise<{
        data: ({
            supplier: {
                id: string;
                name: string;
                phone: string | null;
            };
            _count: {
                items: number;
            };
        } & {
            number: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            updatedById: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            taxable: import("@prisma/client/runtime/library").Decimal;
            vatAmount: import("@prisma/client/runtime/library").Decimal;
            paid: import("@prisma/client/runtime/library").Decimal;
            balance: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            status: import("@prisma/client").$Enums.DocumentStatus;
            invoiceDate: Date;
            postedAt: Date | null;
            voidedAt: Date | null;
            supplierId: string;
        })[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: unknown, user: AuthUser): Promise<Record<string, unknown>>;
    update(id: string, body: unknown, user: AuthUser): Promise<Record<string, unknown>>;
    post(id: string, body: unknown, user: AuthUser): Promise<Record<string, unknown>>;
    void(id: string, user: AuthUser): Promise<Record<string, unknown>>;
}
