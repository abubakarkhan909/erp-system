"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
function startOfToday() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
function endOfToday() {
    const start = startOfToday();
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}
function startOfMonth() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const todayStart = startOfToday();
        const todayEnd = endOfToday();
        const monthStart = startOfMonth();
        const postedToday = {
            invoiceDate: { gte: todayStart, lt: todayEnd },
            status: 'POSTED',
            deletedAt: null,
        };
        const [todaySales, todayPurchases, todayExpenses, openSession, bankAgg, customerReceivables, supplierPayables, upcomingInstallments, lowStockProducts, mtdSalesVat, mtdPurchaseVat, mtdSalesTaxable, mtdPurchaseTaxable,] = await Promise.all([
            this.prisma.saleInvoice.aggregate({
                where: postedToday,
                _sum: { total: true },
            }),
            this.prisma.purchaseInvoice.aggregate({
                where: postedToday,
                _sum: { total: true },
            }),
            this.prisma.expense.aggregate({
                where: { expenseDate: { gte: todayStart, lt: todayEnd } },
                _sum: { amount: true },
            }),
            this.prisma.cashSession.findFirst({
                where: { status: 'OPEN' },
                include: { transactions: true },
                orderBy: { openedAt: 'desc' },
            }),
            this.prisma.bankAccount.aggregate({
                where: { isActive: true, deletedAt: null },
                _sum: { currentBalance: true },
            }),
            this.prisma.customer.aggregate({
                where: { deletedAt: null, currentBalance: { gt: 0 } },
                _sum: { currentBalance: true },
            }),
            this.prisma.supplier.aggregate({
                where: { deletedAt: null, currentBalance: { gt: 0 } },
                _sum: { currentBalance: true },
            }),
            this.prisma.installmentSchedule.count({
                where: {
                    dueDate: { gte: todayStart },
                    status: { in: ['PENDING', 'LATE', 'PARTIAL'] },
                },
            }),
            this.prisma.product.findMany({
                where: {
                    deletedAt: null,
                    status: 'ACTIVE',
                    stockBalance: { isNot: null },
                },
                include: { stockBalance: true },
            }),
            this.prisma.saleInvoice.aggregate({
                where: {
                    invoiceDate: { gte: monthStart, lt: todayEnd },
                    status: 'POSTED',
                    deletedAt: null,
                },
                _sum: { vatAmount: true },
            }),
            this.prisma.purchaseInvoice.aggregate({
                where: {
                    invoiceDate: { gte: monthStart, lt: todayEnd },
                    status: 'POSTED',
                    deletedAt: null,
                },
                _sum: { vatAmount: true },
            }),
            this.prisma.saleInvoice.aggregate({
                where: {
                    invoiceDate: { gte: monthStart, lt: todayEnd },
                    status: 'POSTED',
                    deletedAt: null,
                },
                _sum: { taxable: true },
            }),
            this.prisma.purchaseInvoice.aggregate({
                where: {
                    invoiceDate: { gte: monthStart, lt: todayEnd },
                    status: 'POSTED',
                    deletedAt: null,
                },
                _sum: { taxable: true },
            }),
        ]);
        let cashBalance = new client_1.Prisma.Decimal(0);
        if (openSession) {
            cashBalance = openSession.openingCash;
            for (const txn of openSession.transactions) {
                cashBalance =
                    txn.type === 'OUT' ? cashBalance.sub(txn.amount) : cashBalance.add(txn.amount);
            }
        }
        const lowStockCount = lowStockProducts.filter((p) => {
            const sb = p.stockBalance;
            if (!sb)
                return false;
            const qtyLow = sb.onHandQty.lessThan(p.minStockQty);
            const weightLow = sb.onHandWeight.lessThan(p.minStockWeight);
            return qtyLow || weightLow;
        }).length;
        const outputVat = mtdSalesVat._sum.vatAmount ?? new client_1.Prisma.Decimal(0);
        const inputVat = mtdPurchaseVat._sum.vatAmount ?? new client_1.Prisma.Decimal(0);
        return {
            date: todayStart.toISOString().slice(0, 10),
            today: {
                sales: (0, pagination_1.decimalStr)(todaySales._sum.total),
                purchases: (0, pagination_1.decimalStr)(todayPurchases._sum.total),
                expenses: (0, pagination_1.decimalStr)(todayExpenses._sum.amount),
            },
            balances: {
                cash: (0, pagination_1.decimalStr)(cashBalance),
                bank: (0, pagination_1.decimalStr)(bankAgg._sum.currentBalance),
            },
            pending: {
                customerPayments: (0, pagination_1.decimalStr)(customerReceivables._sum.currentBalance),
                supplierPayments: (0, pagination_1.decimalStr)(supplierPayables._sum.currentBalance),
            },
            upcomingInstallments,
            lowStockCount,
            vatMonthToDate: {
                outputVat: (0, pagination_1.decimalStr)(outputVat),
                inputVat: (0, pagination_1.decimalStr)(inputVat),
                netVat: (0, pagination_1.decimalStr)(outputVat.sub(inputVat)),
                taxableSales: (0, pagination_1.decimalStr)(mtdSalesTaxable._sum.taxable),
                taxablePurchases: (0, pagination_1.decimalStr)(mtdPurchaseTaxable._sum.taxable),
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map