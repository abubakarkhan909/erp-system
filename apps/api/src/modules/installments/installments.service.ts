import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InstallmentStatus, Prisma } from '@prisma/client';
import { moneySchema } from '@jewelry-erp/shared';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr, paginatedResult, parsePagination } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';
import { startOfDayUtc } from '../../common/utils/date-range';

const createPlanSchema = z.object({
  saleInvoiceId: z.string().cuid(),
  advanceAmount: moneySchema.default('0.000'),
  installmentCount: z.coerce.number().int().min(1).max(60),
  firstDueDate: z.string().or(z.coerce.date()),
  installmentAmount: moneySchema.optional(),
});

const recordPaymentSchema = z.object({
  amount: moneySchema,
});

@Injectable()
export class InstallmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(body: unknown, userId?: string) {
    const dto = zodValidate(createPlanSchema, body);

    const invoice = await this.prisma.saleInvoice.findFirst({
      where: { id: dto.saleInvoiceId, deletedAt: null, status: 'POSTED' },
    });
    if (!invoice) throw new NotFoundException('Posted sale invoice not found');

    const existing = await this.prisma.installmentPlan.findUnique({
      where: { saleInvoiceId: dto.saleInvoiceId },
    });
    if (existing) throw new ConflictException('Installment plan already exists for this invoice');

    const total = invoice.balance.greaterThan(0) ? invoice.balance : invoice.total;
    const advance = new Prisma.Decimal(dto.advanceAmount ?? '0.000');
    const remaining = total.sub(advance);
    if (remaining.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Nothing to finance after advance');
    }

    const installmentAmount =
      dto.installmentAmount != null
        ? new Prisma.Decimal(dto.installmentAmount)
        : remaining.div(dto.installmentCount).toDecimalPlaces(3);

    const firstDue = new Date(dto.firstDueDate);
    const schedules: Array<{ dueDate: Date; amount: Prisma.Decimal }> = [];
    let allocated = new Prisma.Decimal(0);

    for (let i = 0; i < dto.installmentCount; i++) {
      const dueDate = new Date(firstDue);
      dueDate.setUTCMonth(dueDate.getUTCMonth() + i);
      const amount =
        i === dto.installmentCount - 1
          ? remaining.sub(allocated)
          : installmentAmount;
      schedules.push({ dueDate, amount });
      allocated = allocated.add(amount);
    }

    const plan = await this.prisma.installmentPlan.create({
      data: {
        saleInvoiceId: dto.saleInvoiceId,
        totalAmount: total,
        advanceAmount: advance,
        remainingAmount: remaining,
        installmentAmount,
        installmentCount: dto.installmentCount,
        createdById: userId,
        schedules: {
          create: schedules.map((s) => ({
            dueDate: s.dueDate,
            amount: s.amount,
          })),
        },
      },
      include: {
        schedules: { orderBy: { dueDate: 'asc' } },
        saleInvoice: { select: { id: true, number: true, customerId: true } },
      },
    });

    return this.formatPlan(plan);
  }

  async listPlans(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const [rows, total] = await Promise.all([
      this.prisma.installmentPlan.findMany({
        skip,
        take,
        include: {
          saleInvoice: { select: { id: true, number: true, customerId: true } },
          schedules: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.installmentPlan.count(),
    ]);

    return paginatedResult(
      rows.map((p) => ({
        id: p.id,
        saleInvoice: p.saleInvoice,
        totalAmount: decimalStr(p.totalAmount),
        remainingAmount: decimalStr(p.remainingAmount),
        installmentCount: p.installmentCount,
        paidCount: p.schedules.filter((s) => s.status === 'PAID').length,
        createdAt: p.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    );
  }

  async getPlan(id: string) {
    const plan = await this.prisma.installmentPlan.findUnique({
      where: { id },
      include: {
        schedules: { orderBy: { dueDate: 'asc' } },
        saleInvoice: { select: { id: true, number: true, customerId: true, total: true, balance: true } },
      },
    });
    if (!plan) throw new NotFoundException('Installment plan not found');
    return this.formatPlan(plan);
  }

  async listSchedules(planId: string, query: Record<string, unknown>) {
    await this.getPlan(planId);
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const where = { installmentPlanId: planId };
    const [rows, total] = await Promise.all([
      this.prisma.installmentSchedule.findMany({
        where,
        skip,
        take,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.installmentSchedule.count({ where }),
    ]);

    return paginatedResult(rows.map((s) => this.formatSchedule(s)), total, page, pageSize);
  }

  async recordPayment(scheduleId: string, body: unknown, _userId?: string) {
    const { amount } = zodValidate(recordPaymentSchema, body);
    const payment = new Prisma.Decimal(amount);

    const schedule = await this.prisma.installmentSchedule.findUnique({
      where: { id: scheduleId },
      include: { installmentPlan: true },
    });
    if (!schedule) throw new NotFoundException('Installment schedule not found');
    if (schedule.status === 'PAID') {
      throw new BadRequestException('Schedule already fully paid');
    }

    const newPaid = schedule.paidAmount.add(payment);
    const due = schedule.amount;
    if (newPaid.greaterThan(due)) {
      throw new BadRequestException('Payment exceeds schedule amount');
    }

    const today = startOfDayUtc(new Date());
    let status: InstallmentStatus;
    if (newPaid.equals(due)) {
      status = 'PAID';
    } else {
      status = schedule.dueDate < today ? 'LATE' : 'PARTIAL';
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const sched = await tx.installmentSchedule.update({
        where: { id: scheduleId },
        data: {
          paidAmount: newPaid,
          status,
          paidAt: status === 'PAID' ? new Date() : schedule.paidAt,
        },
      });

      const planRemaining = schedule.installmentPlan.remainingAmount.sub(payment);
      await tx.installmentPlan.update({
        where: { id: schedule.installmentPlanId },
        data: { remainingAmount: planRemaining.lessThan(0) ? 0 : planRemaining },
      });

      const invoice = await tx.saleInvoice.findUnique({
        where: { id: schedule.installmentPlan.saleInvoiceId },
      });
      if (invoice) {
        const newPaidInv = invoice.paid.add(payment);
        const newBalance = invoice.total.sub(newPaidInv);
        await tx.saleInvoice.update({
          where: { id: invoice.id },
          data: { paid: newPaidInv, balance: newBalance.lessThan(0) ? 0 : newBalance },
        });
      }

      return sched;
    });

    return this.formatSchedule(updated);
  }

  async upcoming(query: Record<string, unknown>) {
    const days = Number(query.days) || 30;
    const today = startOfDayUtc(new Date());
    const until = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where = {
      dueDate: { gte: today, lte: until },
      status: { in: ['PENDING', 'PARTIAL'] as InstallmentStatus[] },
    };

    const [rows, total] = await Promise.all([
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
    ]);

    return paginatedResult(
      rows.map((s) => ({
        ...this.formatSchedule(s),
        saleInvoice: s.installmentPlan.saleInvoice,
      })),
      total,
      page,
      pageSize,
    );
  }

  async late(query: Record<string, unknown>) {
    const today = startOfDayUtc(new Date());
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );

    const where = {
      dueDate: { lt: today },
      status: { in: ['PENDING', 'PARTIAL', 'LATE'] as InstallmentStatus[] },
    };

    const [rows, total] = await Promise.all([
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
    ]);

    return paginatedResult(
      rows.map((s) => ({
        ...this.formatSchedule(s),
        saleInvoice: s.installmentPlan.saleInvoice,
        daysLate: Math.floor((today.getTime() - s.dueDate.getTime()) / (24 * 60 * 60 * 1000)),
      })),
      total,
      page,
      pageSize,
    );
  }

  private formatPlan(plan: {
    id: string;
    saleInvoiceId: string;
    totalAmount: Prisma.Decimal;
    advanceAmount: Prisma.Decimal;
    remainingAmount: Prisma.Decimal;
    installmentAmount: Prisma.Decimal;
    installmentCount: number;
    createdAt: Date;
    saleInvoice?: { id: string; number: string; customerId: string | null; total?: Prisma.Decimal; balance?: Prisma.Decimal };
    schedules?: Array<{
      id: string;
      dueDate: Date;
      amount: Prisma.Decimal;
      paidAmount: Prisma.Decimal;
      status: InstallmentStatus;
      paidAt: Date | null;
    }>;
  }) {
    return {
      id: plan.id,
      saleInvoiceId: plan.saleInvoiceId,
      saleInvoice: plan.saleInvoice
        ? {
            ...plan.saleInvoice,
            total: plan.saleInvoice.total != null ? decimalStr(plan.saleInvoice.total) : undefined,
            balance: plan.saleInvoice.balance != null ? decimalStr(plan.saleInvoice.balance) : undefined,
          }
        : undefined,
      totalAmount: decimalStr(plan.totalAmount),
      advanceAmount: decimalStr(plan.advanceAmount),
      remainingAmount: decimalStr(plan.remainingAmount),
      installmentAmount: decimalStr(plan.installmentAmount),
      installmentCount: plan.installmentCount,
      createdAt: plan.createdAt.toISOString(),
      schedules: plan.schedules?.map((s) => this.formatSchedule(s)),
    };
  }

  private formatSchedule(schedule: {
    id: string;
    dueDate: Date;
    amount: Prisma.Decimal;
    paidAmount: Prisma.Decimal;
    status: InstallmentStatus;
    paidAt?: Date | null;
  }) {
    return {
      id: schedule.id,
      dueDate: schedule.dueDate.toISOString().slice(0, 10),
      amount: decimalStr(schedule.amount),
      paidAmount: decimalStr(schedule.paidAmount),
      remaining: decimalStr(schedule.amount.sub(schedule.paidAmount)),
      status: schedule.status,
      paidAt: schedule.paidAt?.toISOString() ?? null,
    };
  }
}
