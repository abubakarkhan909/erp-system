import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr } from '../../common/utils/pagination';

function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function endOfToday(): Date {
  const start = startOfToday();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();
    const monthStart = startOfMonth();

    const postedToday = {
      invoiceDate: { gte: todayStart, lt: todayEnd },
      status: 'POSTED' as const,
      deletedAt: null,
    };

    const [
      todaySales,
      todayPurchases,
      todayExpenses,
      openSession,
      bankAgg,
      customerReceivables,
      supplierPayables,
      upcomingInstallments,
      lowStockProducts,
      mtdSalesVat,
      mtdPurchaseVat,
      mtdSalesTaxable,
      mtdPurchaseTaxable,
    ] = await Promise.all([
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

    let cashBalance = new Prisma.Decimal(0);
    if (openSession) {
      cashBalance = openSession.openingCash;
      for (const txn of openSession.transactions) {
        cashBalance =
          txn.type === 'OUT' ? cashBalance.sub(txn.amount) : cashBalance.add(txn.amount);
      }
    }

    const lowStockCount = lowStockProducts.filter((p) => {
      const sb = p.stockBalance;
      if (!sb) return false;
      const qtyLow = sb.onHandQty.lessThan(p.minStockQty);
      const weightLow = sb.onHandWeight.lessThan(p.minStockWeight);
      return qtyLow || weightLow;
    }).length;

    const outputVat = mtdSalesVat._sum.vatAmount ?? new Prisma.Decimal(0);
    const inputVat = mtdPurchaseVat._sum.vatAmount ?? new Prisma.Decimal(0);

    return {
      date: todayStart.toISOString().slice(0, 10),
      today: {
        sales: decimalStr(todaySales._sum.total),
        purchases: decimalStr(todayPurchases._sum.total),
        expenses: decimalStr(todayExpenses._sum.amount),
      },
      balances: {
        cash: decimalStr(cashBalance),
        bank: decimalStr(bankAgg._sum.currentBalance),
      },
      pending: {
        customerPayments: decimalStr(customerReceivables._sum.currentBalance),
        supplierPayments: decimalStr(supplierPayables._sum.currentBalance),
      },
      upcomingInstallments,
      lowStockCount,
      vatMonthToDate: {
        outputVat: decimalStr(outputVat),
        inputVat: decimalStr(inputVat),
        netVat: decimalStr(outputVat.sub(inputVat)),
        taxableSales: decimalStr(mtdSalesTaxable._sum.taxable),
        taxablePurchases: decimalStr(mtdPurchaseTaxable._sum.taxable),
      },
    };
  }
}
