import { SalesService } from './sales.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(query: Record<string, unknown>): Promise<{
        data: ({
            customer: {
                id: string;
                name: string;
                phone: string | null;
            } | null;
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
            customerId: string | null;
            invoiceDate: Date;
            postedAt: Date | null;
            voidedAt: Date | null;
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
