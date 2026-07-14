import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
import { InventoryService } from '../inventory/inventory.service';
import { AccountingService } from '../accounting/accounting.service';
export declare class PurchasesService {
    private readonly prisma;
    private readonly numberSeries;
    private readonly inventory;
    private readonly accounting;
    constructor(prisma: PrismaService, numberSeries: NumberSeriesService, inventory: InventoryService, accounting: AccountingService);
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
            total: Prisma.Decimal;
            subtotal: Prisma.Decimal;
            discount: Prisma.Decimal;
            taxable: Prisma.Decimal;
            vatAmount: Prisma.Decimal;
            paid: Prisma.Decimal;
            balance: Prisma.Decimal;
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
    createDraft(body: unknown, userId?: string): Promise<Record<string, unknown>>;
    updateDraft(id: string, body: unknown, userId?: string): Promise<Record<string, unknown>>;
    post(id: string, body: unknown, userId?: string): Promise<Record<string, unknown>>;
    voidPosted(id: string, userId?: string): Promise<Record<string, unknown>>;
    private calcInvoiceTotals;
    private postPurchaseJournal;
    private recordCashOut;
    private recordCashIn;
    private serializeInvoice;
}
