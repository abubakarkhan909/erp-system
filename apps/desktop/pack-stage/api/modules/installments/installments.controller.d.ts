import type { AuthUser } from '@jewelry-erp/shared';
import { InstallmentsService } from './installments.service';
export declare class InstallmentsController {
    private readonly installmentsService;
    constructor(installmentsService: InstallmentsService);
    createPlan(body: unknown, user: AuthUser): Promise<{
        id: string;
        saleInvoiceId: string;
        saleInvoice: {
            total: string | undefined;
            balance: string | undefined;
            id: string;
            number: string;
            customerId: string | null;
        } | undefined;
        totalAmount: string;
        advanceAmount: string;
        remainingAmount: string;
        installmentAmount: string;
        installmentCount: number;
        createdAt: string;
        schedules: {
            id: string;
            dueDate: string;
            amount: string;
            paidAmount: string;
            remaining: string;
            status: import("@prisma/client").$Enums.InstallmentStatus;
            paidAt: string | null;
        }[] | undefined;
    }>;
    listPlans(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            saleInvoice: {
                number: string;
                id: string;
                customerId: string | null;
            };
            totalAmount: string;
            remainingAmount: string;
            installmentCount: number;
            paidCount: number;
            createdAt: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getPlan(id: string): Promise<{
        id: string;
        saleInvoiceId: string;
        saleInvoice: {
            total: string | undefined;
            balance: string | undefined;
            id: string;
            number: string;
            customerId: string | null;
        } | undefined;
        totalAmount: string;
        advanceAmount: string;
        remainingAmount: string;
        installmentAmount: string;
        installmentCount: number;
        createdAt: string;
        schedules: {
            id: string;
            dueDate: string;
            amount: string;
            paidAmount: string;
            remaining: string;
            status: import("@prisma/client").$Enums.InstallmentStatus;
            paidAt: string | null;
        }[] | undefined;
    }>;
    listSchedules(id: string, query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            dueDate: string;
            amount: string;
            paidAmount: string;
            remaining: string;
            status: import("@prisma/client").$Enums.InstallmentStatus;
            paidAt: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    recordPayment(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        dueDate: string;
        amount: string;
        paidAmount: string;
        remaining: string;
        status: import("@prisma/client").$Enums.InstallmentStatus;
        paidAt: string | null;
    }>;
    upcoming(query: Record<string, unknown>): Promise<{
        data: {
            saleInvoice: {
                number: string;
                id: string;
                customerId: string | null;
            };
            id: string;
            dueDate: string;
            amount: string;
            paidAmount: string;
            remaining: string;
            status: import("@prisma/client").$Enums.InstallmentStatus;
            paidAt: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    late(query: Record<string, unknown>): Promise<{
        data: {
            saleInvoice: {
                number: string;
                id: string;
                customerId: string | null;
            };
            daysLate: number;
            id: string;
            dueDate: string;
            amount: string;
            paidAmount: string;
            remaining: string;
            status: import("@prisma/client").$Enums.InstallmentStatus;
            paidAt: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
}
