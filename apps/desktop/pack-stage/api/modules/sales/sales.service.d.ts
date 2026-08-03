import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
import { InventoryService } from '../inventory/inventory.service';
import { AccountingService } from '../accounting/accounting.service';
export declare class SalesService {
    private readonly prisma;
    private readonly numberSeries;
    private readonly inventory;
    private readonly accounting;
    constructor(prisma: PrismaService, numberSeries: NumberSeriesService, inventory: InventoryService, accounting: AccountingService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "N/A";
        }[];
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
    deleteDraft(id: string, userId?: string): Promise<{
        deleted: boolean;
    }>;
    voidPosted(id: string, userId?: string): Promise<Record<string, unknown>>;
    private calcInvoiceTotals;
    private postSaleJournal;
    private recordCashMovement;
    private serializeInvoice;
}
