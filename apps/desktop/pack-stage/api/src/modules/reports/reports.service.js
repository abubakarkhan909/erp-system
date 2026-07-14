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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const date_range_1 = require("../../common/utils/date-range");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    postedSalesWhere(from, to) {
        return {
            invoiceDate: { gte: from, lt: to },
            status: 'POSTED',
            deletedAt: null,
        };
    }
    postedPurchasesWhere(from, to) {
        return {
            invoiceDate: { gte: from, lt: to },
            status: 'POSTED',
            deletedAt: null,
        };
    }
    async sales(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const where = this.postedSalesWhere(from, to);
        const [agg, count, byDay] = await Promise.all([
            this.prisma.saleInvoice.aggregate({
                where,
                _sum: { subtotal: true, discount: true, taxable: true, vatAmount: true, total: true, paid: true, balance: true },
                _count: true,
            }),
            this.prisma.saleInvoice.count({ where }),
            this.prisma.saleInvoice.groupBy({
                by: ['invoiceDate'],
                where,
                _sum: { total: true },
                orderBy: { invoiceDate: 'asc' },
            }),
        ]);
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            count,
            totals: {
                subtotal: (0, pagination_1.decimalStr)(agg._sum.subtotal),
                discount: (0, pagination_1.decimalStr)(agg._sum.discount),
                taxable: (0, pagination_1.decimalStr)(agg._sum.taxable),
                vatAmount: (0, pagination_1.decimalStr)(agg._sum.vatAmount),
                total: (0, pagination_1.decimalStr)(agg._sum.total),
                paid: (0, pagination_1.decimalStr)(agg._sum.paid),
                balance: (0, pagination_1.decimalStr)(agg._sum.balance),
            },
            breakdown: byDay.map((d) => ({
                date: d.invoiceDate.toISOString().slice(0, 10),
                total: (0, pagination_1.decimalStr)(d._sum.total),
            })),
        };
    }
    async purchases(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const where = this.postedPurchasesWhere(from, to);
        const [agg, count] = await Promise.all([
            this.prisma.purchaseInvoice.aggregate({
                where,
                _sum: { subtotal: true, taxable: true, vatAmount: true, total: true, paid: true, balance: true },
                _count: true,
            }),
            this.prisma.purchaseInvoice.count({ where }),
        ]);
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            count,
            totals: {
                subtotal: (0, pagination_1.decimalStr)(agg._sum.subtotal),
                taxable: (0, pagination_1.decimalStr)(agg._sum.taxable),
                vatAmount: (0, pagination_1.decimalStr)(agg._sum.vatAmount),
                total: (0, pagination_1.decimalStr)(agg._sum.total),
                paid: (0, pagination_1.decimalStr)(agg._sum.paid),
                balance: (0, pagination_1.decimalStr)(agg._sum.balance),
            },
        };
    }
    async expenses(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const where = { expenseDate: { gte: from, lt: to } };
        const [agg, byCategory] = await Promise.all([
            this.prisma.expense.aggregate({ where, _sum: { amount: true }, _count: true }),
            this.prisma.expense.groupBy({
                by: ['categoryId'],
                where,
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        const categories = await this.prisma.expenseCategory.findMany({
            where: { id: { in: byCategory.map((c) => c.categoryId) } },
        });
        const catMap = new Map(categories.map((c) => [c.id, c]));
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            count: agg._count,
            total: (0, pagination_1.decimalStr)(agg._sum.amount),
            byCategory: byCategory.map((c) => ({
                categoryId: c.categoryId,
                categoryName: catMap.get(c.categoryId)?.name ?? 'Unknown',
                count: c._count,
                amount: (0, pagination_1.decimalStr)(c._sum.amount),
            })),
        };
    }
    async profit(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const salesWhere = this.postedSalesWhere(from, to);
        const purchasesWhere = this.postedPurchasesWhere(from, to);
        const [salesAgg, purchaseAgg, expenseAgg, cogsAgg] = await Promise.all([
            this.prisma.saleInvoice.aggregate({ where: salesWhere, _sum: { total: true, taxable: true } }),
            this.prisma.purchaseInvoice.aggregate({ where: purchasesWhere, _sum: { total: true } }),
            this.prisma.expense.aggregate({
                where: { expenseDate: { gte: from, lt: to } },
                _sum: { amount: true },
            }),
            this.prisma.purchaseInvoiceItem.aggregate({
                where: { purchaseInvoice: purchasesWhere },
                _sum: { lineNet: true },
            }),
        ]);
        const revenue = salesAgg._sum.total ?? new client_1.Prisma.Decimal(0);
        const cogs = cogsAgg._sum.lineNet ?? new client_1.Prisma.Decimal(0);
        const expenses = expenseAgg._sum.amount ?? new client_1.Prisma.Decimal(0);
        const grossProfit = revenue.sub(cogs);
        const netProfit = grossProfit.sub(expenses);
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            revenue: (0, pagination_1.decimalStr)(revenue),
            cogs: (0, pagination_1.decimalStr)(cogs),
            grossProfit: (0, pagination_1.decimalStr)(grossProfit),
            expenses: (0, pagination_1.decimalStr)(expenses),
            purchasesTotal: (0, pagination_1.decimalStr)(purchaseAgg._sum.total),
            netProfit: (0, pagination_1.decimalStr)(netProfit),
        };
    }
    async inventory(query) {
        const { page, pageSize, skip, take, search } = (0, pagination_1.parsePagination)(query);
        const where = {
            deletedAt: null,
            status: 'ACTIVE',
            stockBalance: { isNot: null },
        };
        if (search) {
            where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take,
                include: { stockBalance: true, category: true, brand: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.product.count({ where }),
        ]);
        let totalQty = new client_1.Prisma.Decimal(0);
        let totalWeight = new client_1.Prisma.Decimal(0);
        let totalValue = new client_1.Prisma.Decimal(0);
        const data = products.map((p) => {
            const sb = p.stockBalance;
            totalQty = totalQty.add(sb.onHandQty);
            totalWeight = totalWeight.add(sb.onHandWeight);
            const value = sb.onHandQty.mul(p.purchasePrice).add(sb.onHandWeight.mul(p.purchasePrice));
            totalValue = totalValue.add(value);
            return {
                id: p.id,
                sku: p.sku,
                name: p.name,
                category: p.category?.name,
                brand: p.brand?.name,
                onHandQty: (0, pagination_1.decimalStr)(sb.onHandQty),
                onHandWeight: (0, pagination_1.decimalStr)(sb.onHandWeight),
                purchasePrice: (0, pagination_1.decimalStr)(p.purchasePrice),
                estimatedValue: (0, pagination_1.decimalStr)(value),
            };
        });
        return {
            ...(0, pagination_1.paginatedResult)(data, total, page, pageSize),
            summary: {
                totalQty: (0, pagination_1.decimalStr)(totalQty),
                totalWeight: (0, pagination_1.decimalStr)(totalWeight),
                totalValue: (0, pagination_1.decimalStr)(totalValue),
            },
        };
    }
    async lowStock(query) {
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const products = await this.prisma.product.findMany({
            where: { deletedAt: null, status: 'ACTIVE', stockBalance: { isNot: null } },
            include: { stockBalance: true },
        });
        const low = products.filter((p) => {
            const sb = p.stockBalance;
            return sb.onHandQty.lessThan(p.minStockQty) || sb.onHandWeight.lessThan(p.minStockWeight);
        });
        const slice = low.slice(skip, skip + take);
        const data = slice.map((p) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            onHandQty: (0, pagination_1.decimalStr)(p.stockBalance.onHandQty),
            minStockQty: (0, pagination_1.decimalStr)(p.minStockQty),
            onHandWeight: (0, pagination_1.decimalStr)(p.stockBalance.onHandWeight),
            minStockWeight: (0, pagination_1.decimalStr)(p.minStockWeight),
        }));
        return (0, pagination_1.paginatedResult)(data, low.length, page, pageSize);
    }
    async customerStatement(customerId, query) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: customerId, deletedAt: null },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const { from, to } = (0, date_range_1.resolveDateRange)(query);
        const [invoices, payments, returns] = await Promise.all([
            this.prisma.saleInvoice.findMany({
                where: {
                    customerId,
                    deletedAt: null,
                    status: 'POSTED',
                    invoiceDate: { gte: from, lt: to },
                },
                orderBy: { invoiceDate: 'asc' },
                select: { id: true, number: true, invoiceDate: true, total: true, paid: true, balance: true },
            }),
            this.prisma.salePayment.findMany({
                where: {
                    saleInvoice: { customerId, deletedAt: null, invoiceDate: { gte: from, lt: to } },
                },
                orderBy: { createdAt: 'asc' },
                select: { id: true, amount: true, method: true, createdAt: true, saleInvoiceId: true },
            }),
            this.prisma.saleReturn.findMany({
                where: {
                    customerId,
                    status: 'POSTED',
                    returnDate: { gte: from, lt: to },
                },
                orderBy: { returnDate: 'asc' },
                select: { id: true, number: true, returnDate: true, total: true, refundAmount: true },
            }),
        ]);
        return {
            customer: { id: customer.id, name: customer.name, currentBalance: (0, pagination_1.decimalStr)(customer.currentBalance) },
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            invoices: invoices.map((i) => ({
                ...i,
                total: (0, pagination_1.decimalStr)(i.total),
                paid: (0, pagination_1.decimalStr)(i.paid),
                balance: (0, pagination_1.decimalStr)(i.balance),
                invoiceDate: i.invoiceDate.toISOString().slice(0, 10),
            })),
            payments: payments.map((p) => ({
                ...p,
                amount: (0, pagination_1.decimalStr)(p.amount),
                createdAt: p.createdAt.toISOString(),
            })),
            returns: returns.map((r) => ({
                ...r,
                total: (0, pagination_1.decimalStr)(r.total),
                refundAmount: (0, pagination_1.decimalStr)(r.refundAmount),
                returnDate: r.returnDate.toISOString().slice(0, 10),
            })),
        };
    }
    async supplierStatement(supplierId, query) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id: supplierId, deletedAt: null },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        const { from, to } = (0, date_range_1.resolveDateRange)(query);
        const [invoices, payments, returns] = await Promise.all([
            this.prisma.purchaseInvoice.findMany({
                where: {
                    supplierId,
                    deletedAt: null,
                    status: 'POSTED',
                    invoiceDate: { gte: from, lt: to },
                },
                orderBy: { invoiceDate: 'asc' },
                select: { id: true, number: true, invoiceDate: true, total: true, paid: true, balance: true },
            }),
            this.prisma.purchasePayment.findMany({
                where: {
                    purchaseInvoice: { supplierId, deletedAt: null, invoiceDate: { gte: from, lt: to } },
                },
                orderBy: { createdAt: 'asc' },
                select: { id: true, amount: true, method: true, createdAt: true, purchaseInvoiceId: true },
            }),
            this.prisma.purchaseReturn.findMany({
                where: {
                    supplierId,
                    status: 'POSTED',
                    returnDate: { gte: from, lt: to },
                },
                orderBy: { returnDate: 'asc' },
                select: { id: true, number: true, returnDate: true, total: true, refundAmount: true },
            }),
        ]);
        return {
            supplier: { id: supplier.id, name: supplier.name, currentBalance: (0, pagination_1.decimalStr)(supplier.currentBalance) },
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            invoices: invoices.map((i) => ({
                ...i,
                total: (0, pagination_1.decimalStr)(i.total),
                paid: (0, pagination_1.decimalStr)(i.paid),
                balance: (0, pagination_1.decimalStr)(i.balance),
                invoiceDate: i.invoiceDate.toISOString().slice(0, 10),
            })),
            payments: payments.map((p) => ({
                ...p,
                amount: (0, pagination_1.decimalStr)(p.amount),
                createdAt: p.createdAt.toISOString(),
            })),
            returns: returns.map((r) => ({
                ...r,
                total: (0, pagination_1.decimalStr)(r.total),
                refundAmount: (0, pagination_1.decimalStr)(r.refundAmount),
                returnDate: r.returnDate.toISOString().slice(0, 10),
            })),
        };
    }
    async cashFlow(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const [saleCash, purchaseCash, expenses, bankDeposits, bankWithdrawals, sessions] = await Promise.all([
            this.prisma.salePayment.aggregate({
                where: {
                    method: 'CASH',
                    createdAt: { gte: from, lt: to },
                    saleInvoice: { status: 'POSTED', deletedAt: null },
                },
                _sum: { amount: true },
            }),
            this.prisma.purchasePayment.aggregate({
                where: {
                    method: 'CASH',
                    createdAt: { gte: from, lt: to },
                    purchaseInvoice: { status: 'POSTED', deletedAt: null },
                },
                _sum: { amount: true },
            }),
            this.prisma.expense.aggregate({
                where: { expenseDate: { gte: from, lt: to }, paymentMethod: 'CASH' },
                _sum: { amount: true },
            }),
            this.prisma.bankTransaction.aggregate({
                where: { txnDate: { gte: from, lt: to }, type: 'DEPOSIT' },
                _sum: { amount: true },
            }),
            this.prisma.bankTransaction.aggregate({
                where: { txnDate: { gte: from, lt: to }, type: 'WITHDRAW' },
                _sum: { amount: true },
            }),
            this.prisma.cashSession.findMany({
                where: { sessionDate: { gte: from, lt: to } },
                include: { transactions: true },
                orderBy: { sessionDate: 'asc' },
            }),
        ]);
        const cashIn = saleCash._sum.amount ?? new client_1.Prisma.Decimal(0);
        const cashOutPurchases = purchaseCash._sum.amount ?? new client_1.Prisma.Decimal(0);
        const cashOutExpenses = expenses._sum.amount ?? new client_1.Prisma.Decimal(0);
        const netCash = cashIn.sub(cashOutPurchases).sub(cashOutExpenses);
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            cash: {
                inflows: (0, pagination_1.decimalStr)(cashIn),
                purchaseOutflows: (0, pagination_1.decimalStr)(cashOutPurchases),
                expenseOutflows: (0, pagination_1.decimalStr)(cashOutExpenses),
                net: (0, pagination_1.decimalStr)(netCash),
            },
            bank: {
                deposits: (0, pagination_1.decimalStr)(bankDeposits._sum.amount),
                withdrawals: (0, pagination_1.decimalStr)(bankWithdrawals._sum.amount),
            },
            sessions: sessions.map((s) => ({
                id: s.id,
                sessionDate: s.sessionDate.toISOString().slice(0, 10),
                status: s.status,
                openingCash: (0, pagination_1.decimalStr)(s.openingCash),
                closingCash: s.closingCash != null ? (0, pagination_1.decimalStr)(s.closingCash) : null,
            })),
        };
    }
    async installments(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = { dueDate: { gte: from, lt: to } };
        const [schedules, total, agg] = await Promise.all([
            this.prisma.installmentSchedule.findMany({
                where,
                skip,
                take,
                include: {
                    installmentPlan: {
                        include: { saleInvoice: { select: { id: true, number: true, customerId: true } } },
                    },
                },
                orderBy: { dueDate: 'asc' },
            }),
            this.prisma.installmentSchedule.count({ where }),
            this.prisma.installmentSchedule.groupBy({
                by: ['status'],
                where,
                _sum: { amount: true, paidAmount: true },
                _count: true,
            }),
        ]);
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            summary: agg.map((a) => ({
                status: a.status,
                count: a._count,
                amount: (0, pagination_1.decimalStr)(a._sum.amount),
                paidAmount: (0, pagination_1.decimalStr)(a._sum.paidAmount),
            })),
            ...(0, pagination_1.paginatedResult)(schedules.map((s) => ({
                id: s.id,
                dueDate: s.dueDate.toISOString().slice(0, 10),
                amount: (0, pagination_1.decimalStr)(s.amount),
                paidAmount: (0, pagination_1.decimalStr)(s.paidAmount),
                status: s.status,
                saleInvoice: s.installmentPlan.saleInvoice,
            })), total, page, pageSize),
        };
    }
    async advanceOrders(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = {
            deletedAt: null,
            createdAt: { gte: from, lt: to },
        };
        const [orders, total, byStatus] = await Promise.all([
            this.prisma.advanceOrder.findMany({
                where,
                skip,
                take,
                include: { customer: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.advanceOrder.count({ where }),
            this.prisma.advanceOrder.groupBy({
                by: ['status'],
                where,
                _sum: { totalAmount: true, advancePaid: true, remaining: true },
                _count: true,
            }),
        ]);
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            summary: byStatus.map((s) => ({
                status: s.status,
                count: s._count,
                totalAmount: (0, pagination_1.decimalStr)(s._sum.totalAmount),
                advancePaid: (0, pagination_1.decimalStr)(s._sum.advancePaid),
                remaining: (0, pagination_1.decimalStr)(s._sum.remaining),
            })),
            ...(0, pagination_1.paginatedResult)(orders.map((o) => ({
                id: o.id,
                orderNo: o.orderNo,
                customer: o.customer,
                status: o.status,
                totalAmount: (0, pagination_1.decimalStr)(o.totalAmount),
                advancePaid: (0, pagination_1.decimalStr)(o.advancePaid),
                remaining: (0, pagination_1.decimalStr)(o.remaining),
                expectedDelivery: o.expectedDelivery?.toISOString().slice(0, 10) ?? null,
            })), total, page, pageSize),
        };
    }
    async utilityBills(query) {
        const { from, to, period } = (0, date_range_1.resolveDateRange)(query);
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = { dueDate: { gte: from, lt: to } };
        const [bills, total, byStatus] = await Promise.all([
            this.prisma.utilityBill.findMany({
                where,
                skip,
                take,
                orderBy: { dueDate: 'asc' },
            }),
            this.prisma.utilityBill.count({ where }),
            this.prisma.utilityBill.groupBy({
                by: ['status'],
                where,
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        return {
            period,
            from: from.toISOString().slice(0, 10),
            to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
            summary: byStatus.map((s) => ({
                status: s.status,
                count: s._count,
                amount: (0, pagination_1.decimalStr)(s._sum.amount),
            })),
            ...(0, pagination_1.paginatedResult)(bills.map((b) => ({
                id: b.id,
                type: b.type,
                billNumber: b.billNumber,
                dueDate: b.dueDate.toISOString().slice(0, 10),
                paidDate: b.paidDate?.toISOString().slice(0, 10) ?? null,
                amount: (0, pagination_1.decimalStr)(b.amount),
                status: b.status,
            })), total, page, pageSize),
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map