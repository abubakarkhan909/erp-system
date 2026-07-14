import { Prisma, StockMovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export type AdjustStockInput = {
    productId: string;
    type: StockMovementType;
    qty: string;
    weight: string;
    refType?: string;
    refId?: string;
    notes?: string;
    createdById?: string;
};
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    adjustStock(tx: Prisma.TransactionClient, input: AdjustStockInput): Promise<{
        balance: {
            id: string;
            updatedAt: Date;
            onHandQty: Prisma.Decimal;
            onHandWeight: Prisma.Decimal;
            reservedQty: Prisma.Decimal;
            reservedWeight: Prisma.Decimal;
            damagedQty: Prisma.Decimal;
            damagedWeight: Prisma.Decimal;
            productId: string;
        };
        movement: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            notes: string | null;
            type: import("@prisma/client").$Enums.StockMovementType;
            productId: string;
            qty: Prisma.Decimal;
            weight: Prisma.Decimal;
            refType: string | null;
            refId: string | null;
        };
    }>;
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
            qty: Prisma.Decimal;
            weight: Prisma.Decimal;
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
                minStockWeight: Prisma.Decimal;
                sku: string;
                minStockQty: Prisma.Decimal;
            };
        } & {
            id: string;
            updatedAt: Date;
            onHandQty: Prisma.Decimal;
            onHandWeight: Prisma.Decimal;
            reservedQty: Prisma.Decimal;
            reservedWeight: Prisma.Decimal;
            damagedQty: Prisma.Decimal;
            damagedWeight: Prisma.Decimal;
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
            minStockWeight: Prisma.Decimal;
            status: import("@prisma/client").$Enums.ProductStatus;
            sku: string;
            minStockQty: Prisma.Decimal;
        };
    } & {
        id: string;
        updatedAt: Date;
        onHandQty: Prisma.Decimal;
        onHandWeight: Prisma.Decimal;
        reservedQty: Prisma.Decimal;
        reservedWeight: Prisma.Decimal;
        damagedQty: Prisma.Decimal;
        damagedWeight: Prisma.Decimal;
        productId: string;
    })[]>;
    manualAdjustment(body: AdjustStockInput): Promise<{
        balance: {
            id: string;
            updatedAt: Date;
            onHandQty: Prisma.Decimal;
            onHandWeight: Prisma.Decimal;
            reservedQty: Prisma.Decimal;
            reservedWeight: Prisma.Decimal;
            damagedQty: Prisma.Decimal;
            damagedWeight: Prisma.Decimal;
            productId: string;
        };
        movement: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            notes: string | null;
            type: import("@prisma/client").$Enums.StockMovementType;
            productId: string;
            qty: Prisma.Decimal;
            weight: Prisma.Decimal;
            refType: string | null;
            refId: string | null;
        };
    }>;
    getBalanceForProduct(productId: string): Promise<({
        product: {
            id: string;
            name: string;
            sku: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        onHandQty: Prisma.Decimal;
        onHandWeight: Prisma.Decimal;
        reservedQty: Prisma.Decimal;
        reservedWeight: Prisma.Decimal;
        damagedQty: Prisma.Decimal;
        damagedWeight: Prisma.Decimal;
        productId: string;
    }) | {
        productId: string;
        onHandQty: string;
        onHandWeight: string;
        reservedQty: string;
        reservedWeight: string;
    }>;
}
