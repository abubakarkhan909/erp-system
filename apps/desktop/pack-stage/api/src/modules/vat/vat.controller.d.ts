import type { Response } from 'express';
import { VatService } from './vat.service';
export declare class VatController {
    private readonly vatService;
    constructor(vatService: VatService);
    getReport(year: string, month?: string, quarter?: string): Promise<import("./vat.service").VatReport>;
    exportJson(year: string, month?: string, quarter?: string): Promise<import("./vat.service").VatReport>;
    exportExcel(year: string, month: string | undefined, quarter: string | undefined, res: Response): Promise<void>;
    exportPdf(year: string, month: string | undefined, quarter: string | undefined, res: Response): Promise<void>;
    lockMonth(year: string, month: string): Promise<{
        id: string;
        year: number;
        month: number;
        outputVat: string;
        inputVat: string;
        netVat: string;
        taxableSales: string;
        taxablePurchases: string;
        lockedAt: string | undefined;
    }>;
    listLocked(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            year: number;
            month: number;
            outputVat: string;
            inputVat: string;
            netVat: string;
            taxableSales: string;
            taxablePurchases: string;
            lockedAt: string | null;
            createdAt: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
}
