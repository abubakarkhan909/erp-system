import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr, paginatedResult, parsePagination } from '../../common/utils/pagination';
import { resolveDateRange } from '../../common/utils/date-range';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private postedSalesWhere(from: Date, to: Date): Prisma.SaleInvoiceWhereInput {
    return {
      invoiceDate: { gte: from, lt: to },
      status: 'POSTED',
      deletedAt: null,
    };
  }

  private postedPurchasesWhere(from: Date, to: Date): Prisma.PurchaseInvoiceWhereInput {
    return {
      invoiceDate: { gte: from, lt: to },
      status: 'POSTED',
      deletedAt: null,
    };
  }

  async sales(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);
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
        subtotal: decimalStr(agg._sum.subtotal),
        discount: decimalStr(agg._sum.discount),
        taxable: decimalStr(agg._sum.taxable),
        vatAmount: decimalStr(agg._sum.vatAmount),
        total: decimalStr(agg._sum.total),
        paid: decimalStr(agg._sum.paid),
        balance: decimalStr(agg._sum.balance),
      },
      breakdown: byDay.map((d) => ({
        date: d.invoiceDate.toISOString().slice(0, 10),
        total: decimalStr(d._sum.total),
      })),
    };
  }

  async purchases(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);
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
        subtotal: decimalStr(agg._sum.subtotal),
        taxable: decimalStr(agg._sum.taxable),
        vatAmount: decimalStr(agg._sum.vatAmount),
        total: decimalStr(agg._sum.total),
        paid: decimalStr(agg._sum.paid),
        balance: decimalStr(agg._sum.balance),
      },
    };
  }

  async expenses(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);
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
      total: decimalStr(agg._sum.amount),
      byCategory: byCategory.map((c) => ({
        categoryId: c.categoryId,
        categoryName: catMap.get(c.categoryId)?.name ?? 'Unknown',
        count: c._count,
        amount: decimalStr(c._sum.amount),
      })),
    };
  }

  async profit(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);
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

    const revenue = salesAgg._sum.total ?? new Prisma.Decimal(0);
    const cogs = cogsAgg._sum.lineNet ?? new Prisma.Decimal(0);
    const expenses = expenseAgg._sum.amount ?? new Prisma.Decimal(0);
    const grossProfit = revenue.sub(cogs);
    const netProfit = grossProfit.sub(expenses);

    return {
      period,
      from: from.toISOString().slice(0, 10),
      to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
      revenue: decimalStr(revenue),
      cogs: decimalStr(cogs),
      grossProfit: decimalStr(grossProfit),
      expenses: decimalStr(expenses),
      purchasesTotal: decimalStr(purchaseAgg._sum.total),
      netProfit: decimalStr(netProfit),
    };
  }

  async inventory(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where: Prisma.ProductWhereInput = {
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

    let totalQty = new Prisma.Decimal(0);
    let totalWeight = new Prisma.Decimal(0);
    let totalValue = new Prisma.Decimal(0);

    const data = products.map((p) => {
      const sb = p.stockBalance!;
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
        onHandQty: decimalStr(sb.onHandQty),
        onHandWeight: decimalStr(sb.onHandWeight),
        purchasePrice: decimalStr(p.purchasePrice),
        estimatedValue: decimalStr(value),
      };
    });

    return {
      ...paginatedResult(data, total, page, pageSize),
      summary: {
        totalQty: decimalStr(totalQty),
        totalWeight: decimalStr(totalWeight),
        totalValue: decimalStr(totalValue),
      },
    };
  }

  async lowStock(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const products = await this.prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE', stockBalance: { isNot: null } },
      include: { stockBalance: true },
    });

    const low = products.filter((p) => {
      const sb = p.stockBalance!;
      return sb.onHandQty.lessThan(p.minStockQty) || sb.onHandWeight.lessThan(p.minStockWeight);
    });

    const slice = low.slice(skip, skip + take);
    const data = slice.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      onHandQty: decimalStr(p.stockBalance!.onHandQty),
      minStockQty: decimalStr(p.minStockQty),
      onHandWeight: decimalStr(p.stockBalance!.onHandWeight),
      minStockWeight: decimalStr(p.minStockWeight),
    }));

    return paginatedResult(data, low.length, page, pageSize);
  }

  async customerStatement(customerId: string, query: Record<string, unknown>) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const { from, to } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);

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
      customer: { id: customer.id, name: customer.name, currentBalance: decimalStr(customer.currentBalance) },
      from: from.toISOString().slice(0, 10),
      to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
      invoices: invoices.map((i) => ({
        ...i,
        total: decimalStr(i.total),
        paid: decimalStr(i.paid),
        balance: decimalStr(i.balance),
        invoiceDate: i.invoiceDate.toISOString().slice(0, 10),
      })),
      payments: payments.map((p) => ({
        ...p,
        amount: decimalStr(p.amount),
        createdAt: p.createdAt.toISOString(),
      })),
      returns: returns.map((r) => ({
        ...r,
        total: decimalStr(r.total),
        refundAmount: decimalStr(r.refundAmount),
        returnDate: r.returnDate.toISOString().slice(0, 10),
      })),
    };
  }

  async supplierStatement(supplierId: string, query: Record<string, unknown>) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, deletedAt: null },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const { from, to } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);

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
      supplier: { id: supplier.id, name: supplier.name, currentBalance: decimalStr(supplier.currentBalance) },
      from: from.toISOString().slice(0, 10),
      to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
      invoices: invoices.map((i) => ({
        ...i,
        total: decimalStr(i.total),
        paid: decimalStr(i.paid),
        balance: decimalStr(i.balance),
        invoiceDate: i.invoiceDate.toISOString().slice(0, 10),
      })),
      payments: payments.map((p) => ({
        ...p,
        amount: decimalStr(p.amount),
        createdAt: p.createdAt.toISOString(),
      })),
      returns: returns.map((r) => ({
        ...r,
        total: decimalStr(r.total),
        refundAmount: decimalStr(r.refundAmount),
        returnDate: r.returnDate.toISOString().slice(0, 10),
      })),
    };
  }

  async cashFlow(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);

    const [saleCash, purchaseCash, expenses, bankDeposits, bankWithdrawals, sessions] =
      await Promise.all([
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

    const cashIn = saleCash._sum.amount ?? new Prisma.Decimal(0);
    const cashOutPurchases = purchaseCash._sum.amount ?? new Prisma.Decimal(0);
    const cashOutExpenses = expenses._sum.amount ?? new Prisma.Decimal(0);
    const netCash = cashIn.sub(cashOutPurchases).sub(cashOutExpenses);

    return {
      period,
      from: from.toISOString().slice(0, 10),
      to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
      cash: {
        inflows: decimalStr(cashIn),
        purchaseOutflows: decimalStr(cashOutPurchases),
        expenseOutflows: decimalStr(cashOutExpenses),
        net: decimalStr(netCash),
      },
      bank: {
        deposits: decimalStr(bankDeposits._sum.amount),
        withdrawals: decimalStr(bankWithdrawals._sum.amount),
      },
      sessions: sessions.map((s) => ({
        id: s.id,
        sessionDate: s.sessionDate.toISOString().slice(0, 10),
        status: s.status,
        openingCash: decimalStr(s.openingCash),
        closingCash: s.closingCash != null ? decimalStr(s.closingCash) : null,
      })),
    };
  }

  async installments(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

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
        amount: decimalStr(a._sum.amount),
        paidAmount: decimalStr(a._sum.paidAmount),
      })),
      ...paginatedResult(
        schedules.map((s) => ({
          id: s.id,
          dueDate: s.dueDate.toISOString().slice(0, 10),
          amount: decimalStr(s.amount),
          paidAmount: decimalStr(s.paidAmount),
          status: s.status,
          saleInvoice: s.installmentPlan.saleInvoice,
        })),
        total,
        page,
        pageSize,
      ),
    };
  }

  async advanceOrders(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

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
        totalAmount: decimalStr(s._sum.totalAmount),
        advancePaid: decimalStr(s._sum.advancePaid),
        remaining: decimalStr(s._sum.remaining),
      })),
      ...paginatedResult(
        orders.map((o) => ({
          id: o.id,
          orderNo: o.orderNo,
          customer: o.customer,
          status: o.status,
          totalAmount: decimalStr(o.totalAmount),
          advancePaid: decimalStr(o.advancePaid),
          remaining: decimalStr(o.remaining),
          expectedDelivery: o.expectedDelivery?.toISOString().slice(0, 10) ?? null,
        })),
        total,
        page,
        pageSize,
      ),
    };
  }

  async utilityBills(query: Record<string, unknown>) {
    const { from, to, period } = resolveDateRange(query as Parameters<typeof resolveDateRange>[0]);
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

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
        amount: decimalStr(s._sum.amount),
      })),
      ...paginatedResult(
        bills.map((b) => ({
          id: b.id,
          type: b.type,
          billNumber: b.billNumber,
          dueDate: b.dueDate.toISOString().slice(0, 10),
          paidDate: b.paidDate?.toISOString().slice(0, 10) ?? null,
          amount: decimalStr(b.amount),
          status: b.status,
        })),
        total,
        page,
        pageSize,
      ),
    };
  }
}
