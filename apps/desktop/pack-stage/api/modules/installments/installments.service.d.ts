import { PrismaService } from '../../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
export declare class InstallmentsService {
    private readonly prisma;
    private readonly accounting;
    constructor(prisma: PrismaService, accounting: AccountingService);
    createPlan(body: unknown, userId?: string): Promise<{
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
    listSchedules(planId: string, query: Record<string, unknown>): Promise<{
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
    recordPayment(scheduleId: string, body: unknown, userId?: string): Promise<{
        id: string;
        dueDate: string;
        amount: string;
        paidAmount: string;
        remaining: string;
        status: import("@prisma/client").$Enums.InstallmentStatus;
        paidAt: string | null;
    }>;
    private applyInvoiceReceipt;
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
    private formatPlan;
    private formatSchedule;
}
