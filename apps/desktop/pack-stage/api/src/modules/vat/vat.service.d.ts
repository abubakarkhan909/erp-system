import { PrismaService } from '../../prisma/prisma.service';
export type VatReport = {
    label: string;
    year: number;
    month?: number;
    quarter?: number;
    periodType: 'monthly' | 'quarterly' | 'yearly';
    from: string;
    to: string;
    output: {
        taxableSales: string;
        outputVat: string;
        saleReturnTaxable: string;
        saleReturnVat: string;
        netTaxableSales: string;
        netOutputVat: string;
    };
    input: {
        taxablePurchases: string;
        inputVat: string;
        purchaseReturnTaxable: string;
        purchaseReturnVat: string;
        netTaxablePurchases: string;
        netInputVat: string;
    };
    netVat: string;
    locked?: {
        lockedAt: string;
    } | null;
    documents: {
        sales: Array<{
            id: string;
            number: string;
            date: string;
            taxable: string;
            vatAmount: string;
        }>;
        saleReturns: Array<{
            id: string;
            number: string;
            date: string;
            taxable: string;
            vatAmount: string;
        }>;
        purchases: Array<{
            id: string;
            number: string;
            date: string;
            taxable: string;
            vatAmount: string;
        }>;
        purchaseReturns: Array<{
            id: string;
            number: string;
            date: string;
            taxable: string;
            vatAmount: string;
        }>;
    };
};
export declare class VatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getReport(params: {
        year: number;
        month?: number;
        quarter?: number;
    }): Promise<VatReport>;
    lockMonth(year: number, month: number): Promise<{
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
    listLockedReturns(query: Record<string, unknown>): Promise<{
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
    buildExcelBuffer(report: VatReport): Promise<Buffer>;
    buildPdfBuffer(report: VatReport): Promise<Buffer>;
}
