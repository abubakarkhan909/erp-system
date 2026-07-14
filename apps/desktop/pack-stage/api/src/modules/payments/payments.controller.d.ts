import { PaymentsService } from './payments.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    recordCustomerPayment(body: unknown, user: AuthUser): Promise<{
        reference: string;
        customerId: string;
        amount: string;
        method: "CASH" | "BANK_TRANSFER" | "CARD" | "CHEQUE" | "MIXED" | undefined;
        journalId: string;
        journalNumber: string;
    }>;
    recordSupplierPayment(body: unknown, user: AuthUser): Promise<{
        reference: string;
        supplierId: string;
        amount: string;
        method: "CASH" | "BANK_TRANSFER" | "CARD" | "CHEQUE" | "MIXED" | undefined;
        journalId: string;
        journalNumber: string;
    }>;
}
