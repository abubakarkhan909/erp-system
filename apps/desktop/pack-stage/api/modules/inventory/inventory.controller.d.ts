import { StockMovementType } from '@prisma/client';
import { InventoryService } from './inventory.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    listMovements(query: Record<string, unknown>): Promise<{
        data: ({
            product: {
                id: string;
                name: string;
                sku: string;
            };
        } & {
            id: string;
            createdAt: Date;
            createdById: string | null;
            notes: string | null;
            type: import("@prisma/client").$Enums.StockMovementType;
            productId: string;
            qty: import("@prisma/client/runtime/library").Decimal;
            weight: import("@prisma/client/runtime/library").Decimal;
            refType: string | null;
            refId: string | null;
        })[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getBalances(query: Record<string, unknown>): Promise<{
        data: ({
            product: {
                id: string;
                name: string;
                netWeight: import("@prisma/client/runtime/library").Decimal;
                minStockWeight: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                ownership: import("@prisma/client").$Enums.ProductOwnership;
                minStockQty: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            updatedAt: Date;
            onHandQty: import("@prisma/client/runtime/library").Decimal;
            onHandWeight: import("@prisma/client/runtime/library").Decimal;
            reservedQty: import("@prisma/client/runtime/library").Decimal;
            reservedWeight: import("@prisma/client/runtime/library").Decimal;
            damagedQty: import("@prisma/client/runtime/library").Decimal;
            damagedWeight: import("@prisma/client/runtime/library").Decimal;
            productId: string;
        })[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getLowStock(): Promise<({
        product: {
            id: string;
            name: string;
            minStockWeight: import("@prisma/client/runtime/library").Decimal;
            status: import("@prisma/client").$Enums.ProductStatus;
            sku: string;
            minStockQty: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        updatedAt: Date;
        onHandQty: import("@prisma/client/runtime/library").Decimal;
        onHandWeight: import("@prisma/client/runtime/library").Decimal;
        reservedQty: import("@prisma/client/runtime/library").Decimal;
        reservedWeight: import("@prisma/client/runtime/library").Decimal;
        damagedQty: import("@prisma/client/runtime/library").Decimal;
        damagedWeight: import("@prisma/client/runtime/library").Decimal;
        productId: string;
    })[]>;
    addOwnStock(body: unknown, user: AuthUser): Promise<{
        product: {
            id: string;
            sku: string;
            name: string;
        };
        addedQty: string;
        addedWeight: string;
        onHandQty: string;
        onHandWeight: string;
        movementId: string;
    }>;
    adjust(body: {
        productId: string;
        type: StockMovementType;
        qty: string;
        weight: string;
        refType?: string;
        refId?: string;
        notes?: string;
    }, user: AuthUser): Promise<{
        balance: {
            id: string;
            updatedAt: Date;
            onHandQty: import("@prisma/client/runtime/library").Decimal;
            onHandWeight: import("@prisma/client/runtime/library").Decimal;
            reservedQty: import("@prisma/client/runtime/library").Decimal;
            reservedWeight: import("@prisma/client/runtime/library").Decimal;
            damagedQty: import("@prisma/client/runtime/library").Decimal;
            damagedWeight: import("@prisma/client/runtime/library").Decimal;
            productId: string;
        };
        movement: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            notes: string | null;
            type: import("@prisma/client").$Enums.StockMovementType;
            productId: string;
            qty: import("@prisma/client/runtime/library").Decimal;
            weight: import("@prisma/client/runtime/library").Decimal;
            refType: string | null;
            refId: string | null;
        };
    }>;
}
