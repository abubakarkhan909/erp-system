import { PrismaService } from '../../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { NumberSeriesService } from '../number-series/number-series.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly accounting;
    private readonly numberSeries;
    constructor(prisma: PrismaService, accounting: AccountingService, numberSeries: NumberSeriesService);
    recordCustomerPayment(body: unknown, userId?: string): Promise<{
        reference: string;
        customerId: string;
        amount: string;
        method: "CASH" | "BANK_TRANSFER" | "CARD" | "CHEQUE" | "MIXED" | undefined;
        journalId: string;
        journalNumber: string;
    }>;
    recordSupplierPayment(body: unknown, userId?: string): Promise<{
        reference: string;
        supplierId: string;
        amount: string;
        method: "CASH" | "BANK_TRANSFER" | "CARD" | "CHEQUE" | "MIXED" | undefined;
        journalId: string;
        journalNumber: string;
    }>;
    private recordCashTx;
}
