import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        date: string;
        today: {
            sales: string;
            purchases: string;
            expenses: string;
        };
        balances: {
            cash: string;
            bank: string;
        };
        pending: {
            customerPayments: string;
            supplierPayments: string;
        };
        upcomingInstallments: number;
        lowStockCount: number;
        vatMonthToDate: {
            outputVat: string;
            inputVat: string;
            netVat: string;
            taxableSales: string;
            taxablePurchases: string;
        };
    }>;
}
