import type { AuthUser } from '@jewelry-erp/shared';
import { ExchangesService } from './exchanges.service';
export declare class ExchangesController {
    private readonly exchangesService;
    constructor(exchangesService: ExchangesService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            number: string;
            customerId: string | null;
            customer: {
                id: string;
                name: string;
            } | null | undefined;
            saleInvoiceId: string | null;
            saleInvoice: {
                balance: string | undefined;
                id: string;
                number: string;
            } | null;
            exchangeDate: string;
            karat: import("@prisma/client").$Enums.GoldKarat;
            weight: string;
            ratePerGram: string;
            value: string;
            paymentOut: string;
            status: string;
            notes: string | null;
            postedAt: string | null;
            createdAt: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        number: string;
        customerId: string | null;
        customer: {
            id: string;
            name: string;
        } | null | undefined;
        saleInvoiceId: string | null;
        saleInvoice: {
            balance: string | undefined;
            id: string;
            number: string;
        } | null;
        exchangeDate: string;
        karat: import("@prisma/client").$Enums.GoldKarat;
        weight: string;
        ratePerGram: string;
        value: string;
        paymentOut: string;
        status: string;
        notes: string | null;
        postedAt: string | null;
        createdAt: string;
    }>;
    create(body: unknown, user: AuthUser): Promise<{
        id: string;
        number: string;
        customerId: string | null;
        customer: {
            id: string;
            name: string;
        } | null | undefined;
        saleInvoiceId: string | null;
        saleInvoice: {
            balance: string | undefined;
            id: string;
            number: string;
        } | null;
        exchangeDate: string;
        karat: import("@prisma/client").$Enums.GoldKarat;
        weight: string;
        ratePerGram: string;
        value: string;
        paymentOut: string;
        status: string;
        notes: string | null;
        postedAt: string | null;
        createdAt: string;
    }>;
    post(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        number: string;
        customerId: string | null;
        customer: {
            id: string;
            name: string;
        } | null | undefined;
        saleInvoiceId: string | null;
        saleInvoice: {
            balance: string | undefined;
            id: string;
            number: string;
        } | null;
        exchangeDate: string;
        karat: import("@prisma/client").$Enums.GoldKarat;
        weight: string;
        ratePerGram: string;
        value: string;
        paymentOut: string;
        status: string;
        notes: string | null;
        postedAt: string | null;
        createdAt: string;
    }>;
}
