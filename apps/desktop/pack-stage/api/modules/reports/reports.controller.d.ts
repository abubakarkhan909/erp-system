import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    sales(query: Record<string, unknown>): Promise<{
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        count: number;
        totals: {
            subtotal: string;
            discount: string;
            taxable: string;
            vatAmount: string;
            total: string;
            paid: string;
            balance: string;
        };
        breakdown: {
            date: string;
            total: string;
        }[];
    }>;
    purchases(query: Record<string, unknown>): Promise<{
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        count: number;
        totals: {
            subtotal: string;
            taxable: string;
            vatAmount: string;
            total: string;
            paid: string;
            balance: string;
        };
    }>;
    expenses(query: Record<string, unknown>): Promise<{
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        count: number;
        total: string;
        byCategory: {
            categoryId: string;
            categoryName: string;
            count: number;
            amount: string;
        }[];
    }>;
    profit(query: Record<string, unknown>): Promise<{
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        revenue: string;
        cogs: string;
        grossProfit: string;
        expenses: string;
        purchasesTotal: string;
        netProfit: string;
    }>;
    inventory(query: Record<string, unknown>): Promise<{
        summary: {
            totalQty: string;
            totalWeight: string;
            totalValue: string;
        };
        data: {
            id: string;
            sku: string;
            name: string;
            category: string | undefined;
            brand: string | undefined;
            onHandQty: string;
            onHandWeight: string;
            purchasePrice: string;
            estimatedValue: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    lowStock(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            sku: string;
            name: string;
            onHandQty: string;
            minStockQty: string;
            onHandWeight: string;
            minStockWeight: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    customerStatement(id: string, query: Record<string, unknown>): Promise<{
        customer: {
            id: string;
            name: string;
            currentBalance: string;
        };
        from: string;
        to: string;
        invoices: {
            total: string;
            paid: string;
            balance: string;
            invoiceDate: string;
            number: string;
            id: string;
        }[];
        payments: {
            amount: string;
            createdAt: string;
            id: string;
            saleInvoiceId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
        }[];
        returns: {
            total: string;
            refundAmount: string;
            returnDate: string;
            number: string;
            id: string;
        }[];
    }>;
    supplierStatement(id: string, query: Record<string, unknown>): Promise<{
        supplier: {
            id: string;
            name: string;
            currentBalance: string;
        };
        from: string;
        to: string;
        invoices: {
            total: string;
            paid: string;
            balance: string;
            invoiceDate: string;
            number: string;
            id: string;
        }[];
        payments: {
            amount: string;
            createdAt: string;
            id: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            purchaseInvoiceId: string;
        }[];
        returns: {
            total: string;
            refundAmount: string;
            returnDate: string;
            number: string;
            id: string;
        }[];
    }>;
    cashFlow(query: Record<string, unknown>): Promise<{
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        cash: {
            inflows: string;
            purchaseOutflows: string;
            expenseOutflows: string;
            net: string;
        };
        bank: {
            deposits: string;
            withdrawals: string;
        };
        sessions: {
            id: string;
            sessionDate: string;
            status: import("@prisma/client").$Enums.CashSessionStatus;
            openingCash: string;
            closingCash: string | null;
        }[];
    }>;
    installments(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            dueDate: string;
            amount: string;
            paidAmount: string;
            status: import("@prisma/client").$Enums.InstallmentStatus;
            saleInvoice: {
                number: string;
                id: string;
                customerId: string | null;
            };
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        summary: {
            status: import("@prisma/client").$Enums.InstallmentStatus;
            count: number;
            amount: string;
            paidAmount: string;
        }[];
    }>;
    advanceOrders(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            orderNo: string;
            customer: {
                id: string;
                name: string;
            };
            status: import("@prisma/client").$Enums.AdvanceOrderStatus;
            totalAmount: string;
            advancePaid: string;
            remaining: string;
            expectedDelivery: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        summary: {
            status: import("@prisma/client").$Enums.AdvanceOrderStatus;
            count: number;
            totalAmount: string;
            advancePaid: string;
            remaining: string;
        }[];
    }>;
    utilityBills(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            type: import("@prisma/client").$Enums.UtilityBillType;
            billNumber: string | null;
            dueDate: string;
            paidDate: string | null;
            amount: string;
            status: import("@prisma/client").$Enums.UtilityBillStatus;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
        period: import("../../common/utils/date-range").PeriodGranularity;
        from: string;
        to: string;
        summary: {
            status: import("@prisma/client").$Enums.UtilityBillStatus;
            count: number;
            amount: string;
        }[];
    }>;
}
