import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AdvanceOrderStatus, GoldKarat, Prisma } from '@prisma/client';
import { advanceOrderSchema, moneySchema } from '@jewelry-erp/shared';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
import { postJournalEntry } from '../../common/utils/journal.helper';
import { decimalStr, paginatedResult, parsePagination } from '../../common/utils/pagination';
import { zodValidate } from '../../common/utils/zod-validate';
import { serializeRecord } from '../../common/utils/serialize';

const statusTransitionSchema = z.object({
  status: z.nativeEnum(AdvanceOrderStatus),
});

const advancePaymentSchema = z.object({
  amount: moneySchema,
});

const customOrderSchema = z.object({
  customerId: z.string().cuid(),
  specs: z.string().min(1).max(5000),
  karat: z.nativeEnum(GoldKarat).optional().nullable(),
  estimatedWeight: moneySchema.optional().nullable(),
  estimatedAmount: moneySchema.default('0.000'),
  advancePaid: moneySchema.default('0.000'),
  expectedDelivery: z.string().or(z.coerce.date()).optional().nullable(),
  status: z.nativeEnum(AdvanceOrderStatus).default(AdvanceOrderStatus.PENDING),
});

const repairOrderSchema = z.object({
  customerId: z.string().cuid(),
  description: z.string().min(1).max(5000),
  estimatedAmount: moneySchema.default('0.000'),
  advancePaid: moneySchema.default('0.000'),
  expectedDelivery: z.string().or(z.coerce.date()).optional().nullable(),
  status: z.nativeEnum(AdvanceOrderStatus).default(AdvanceOrderStatus.PENDING),
});

const VALID_TRANSITIONS: Record<AdvanceOrderStatus, AdvanceOrderStatus[]> = {
  PENDING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class AdvancesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberSeries: NumberSeriesService,
  ) {}

  private assertTransition(from: AdvanceOrderStatus, to: AdvanceOrderStatus) {
    if (!VALID_TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(`Cannot transition from ${from} to ${to}`);
    }
  }

  async listAdvanceOrders(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const where: Prisma.AdvanceOrderWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { orderNo: { contains: search } },
        { description: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }
    if (query.status) where.status = query.status as AdvanceOrderStatus;

    const [rows, total] = await Promise.all([
      this.prisma.advanceOrder.findMany({
        where,
        skip,
        take,
        include: { customer: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: sortDir as Prisma.SortOrder },
      }),
      this.prisma.advanceOrder.count({ where }),
    ]);

    return paginatedResult(
      rows.map((r) => this.formatAdvanceOrder(r)),
      total,
      page,
      pageSize,
    );
  }

  async getAdvanceOrder(id: string) {
    const order = await this.prisma.advanceOrder.findFirst({
      where: { id, deletedAt: null },
      include: { customer: true },
    });
    if (!order) throw new NotFoundException('Advance order not found');
    return this.formatAdvanceOrder(order);
  }

  async createAdvanceOrder(body: unknown, userId?: string) {
    const dto = zodValidate(advanceOrderSchema, body);
    const orderNo = await this.numberSeries.nextNumber('ADVANCE_ORDER', 'AO');
    const total = new Prisma.Decimal(dto.totalAmount);
    const advance = new Prisma.Decimal(dto.advancePaid ?? '0.000');
    const remaining = total.sub(advance);

    const order = await this.prisma.advanceOrder.create({
      data: {
        orderNo,
        customerId: dto.customerId,
        description: dto.description,
        expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : null,
        totalAmount: total,
        advancePaid: advance,
        remaining,
        status: dto.status,
        notes: dto.notes ?? null,
        createdById: userId,
      },
      include: { customer: { select: { id: true, name: true } } },
    });

    if (advance.greaterThan(0)) {
      await this.postAdvanceJournal(order.id, advance, userId, `Advance order ${orderNo}`);
    }

    return this.formatAdvanceOrder(order);
  }

  async updateAdvanceOrder(id: string, body: unknown, userId?: string) {
    await this.getAdvanceOrder(id);
    const dto = zodValidate(advanceOrderSchema.partial(), body);

    const existing = await this.prisma.advanceOrder.findUniqueOrThrow({ where: { id } });
    const total = dto.totalAmount != null ? new Prisma.Decimal(dto.totalAmount) : existing.totalAmount;
    const advance =
      dto.advancePaid != null ? new Prisma.Decimal(dto.advancePaid) : existing.advancePaid;
    const remaining = total.sub(advance);

    const order = await this.prisma.advanceOrder.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        description: dto.description,
        expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : undefined,
        totalAmount: dto.totalAmount != null ? total : undefined,
        advancePaid: dto.advancePaid != null ? advance : undefined,
        remaining: dto.totalAmount != null || dto.advancePaid != null ? remaining : undefined,
        notes: dto.notes,
        status: dto.status,
      },
      include: { customer: { select: { id: true, name: true } } },
    });

    return this.formatAdvanceOrder(order);
  }

  async transitionAdvanceOrderStatus(id: string, body: unknown, _userId?: string) {
    const { status } = zodValidate(statusTransitionSchema, body);
    const order = await this.prisma.advanceOrder.findFirst({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException('Advance order not found');
    this.assertTransition(order.status, status);

    const updated = await this.prisma.advanceOrder.update({
      where: { id },
      data: { status },
      include: { customer: { select: { id: true, name: true } } },
    });
    return this.formatAdvanceOrder(updated);
  }

  async recordAdvancePayment(id: string, body: unknown, userId?: string) {
    const { amount } = zodValidate(advancePaymentSchema, body);
    const payment = new Prisma.Decimal(amount);

    const order = await this.prisma.advanceOrder.findFirst({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException('Advance order not found');
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot record payment on closed order');
    }

    const newAdvance = order.advancePaid.add(payment);
    const newRemaining = order.totalAmount.sub(newAdvance);
    if (newRemaining.lessThan(0)) {
      throw new BadRequestException('Payment exceeds remaining balance');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.advanceOrder.update({
        where: { id },
        data: { advancePaid: newAdvance, remaining: newRemaining },
        include: { customer: { select: { id: true, name: true } } },
      });
      await this.postAdvanceJournal(id, payment, userId, `Advance payment ${order.orderNo}`, tx);
      return row;
    });

    return this.formatAdvanceOrder(updated);
  }

  async removeAdvanceOrder(id: string, userId?: string) {
    await this.getAdvanceOrder(id);
    const order = await this.prisma.advanceOrder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return serializeRecord(order as unknown as Record<string, unknown>);
  }

  private async postAdvanceJournal(
    sourceId: string,
    amount: Prisma.Decimal,
    userId?: string,
    memo?: string,
    tx?: Prisma.TransactionClient,
  ) {
    await postJournalEntry(
      this.prisma,
      this.numberSeries,
      {
        entryDate: new Date(),
        memo: memo ?? 'Customer advance received',
        sourceType: 'ADVANCE_ORDER',
        sourceId,
        userId,
        lines: [
          { accountCode: '1000', debit: amount, narration: 'Cash received' },
          { accountCode: '2200', credit: amount, narration: 'Customer advances' },
        ],
      },
      tx,
    );
  }

  private formatAdvanceOrder(order: {
    id: string;
    orderNo: string;
    customerId: string;
    description: string;
    expectedDelivery: Date | null;
    totalAmount: Prisma.Decimal;
    advancePaid: Prisma.Decimal;
    remaining: Prisma.Decimal;
    status: AdvanceOrderStatus;
    notes: string | null;
    createdAt: Date;
    customer?: { id: string; name: string; phone?: string | null };
  }) {
    return {
      id: order.id,
      orderNo: order.orderNo,
      customerId: order.customerId,
      customer: order.customer,
      description: order.description,
      expectedDelivery: order.expectedDelivery?.toISOString().slice(0, 10) ?? null,
      totalAmount: decimalStr(order.totalAmount),
      advancePaid: decimalStr(order.advancePaid),
      remaining: decimalStr(order.remaining),
      status: order.status,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
    };
  }

  async listCustomOrders(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const where: Prisma.CustomOrderWhereInput = {};
    if (search) {
      where.OR = [
        { orderNo: { contains: search } },
        { specs: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }
    if (query.status) where.status = query.status as AdvanceOrderStatus;

    const [rows, total] = await Promise.all([
      this.prisma.customOrder.findMany({
        where,
        skip,
        take,
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: sortDir as Prisma.SortOrder },
      }),
      this.prisma.customOrder.count({ where }),
    ]);

    return paginatedResult(rows.map((r) => this.formatCustomOrder(r)), total, page, pageSize);
  }

  async getCustomOrder(id: string) {
    const order = await this.prisma.customOrder.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!order) throw new NotFoundException('Custom order not found');
    return this.formatCustomOrder(order);
  }

  async createCustomOrder(body: unknown, userId?: string) {
    const dto = zodValidate(customOrderSchema, body);
    const orderNo = await this.numberSeries.nextNumber('CUSTOM_ORDER', 'CO');
    const order = await this.prisma.customOrder.create({
      data: {
        orderNo,
        customerId: dto.customerId,
        specs: dto.specs,
        karat: dto.karat ?? null,
        estimatedWeight: dto.estimatedWeight ?? null,
        estimatedAmount: dto.estimatedAmount,
        advancePaid: dto.advancePaid,
        expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : null,
        status: dto.status,
        createdById: userId,
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    return this.formatCustomOrder(order);
  }

  async updateCustomOrder(id: string, body: unknown, _userId?: string) {
    await this.getCustomOrder(id);
    const dto = zodValidate(customOrderSchema.partial(), body);
    const order = await this.prisma.customOrder.update({
      where: { id },
      data: {
        ...dto,
        expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : undefined,
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    return this.formatCustomOrder(order);
  }

  async transitionCustomOrderStatus(id: string, body: unknown, _userId?: string) {
    const { status } = zodValidate(statusTransitionSchema, body);
    const order = await this.prisma.customOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Custom order not found');
    this.assertTransition(order.status, status);
    const updated = await this.prisma.customOrder.update({
      where: { id },
      data: { status },
      include: { customer: { select: { id: true, name: true } } },
    });
    return this.formatCustomOrder(updated);
  }

  private formatCustomOrder(order: {
    id: string;
    orderNo: string;
    customerId: string;
    specs: string;
    karat: GoldKarat | null;
    estimatedWeight: Prisma.Decimal | null;
    estimatedAmount: Prisma.Decimal;
    advancePaid: Prisma.Decimal;
    expectedDelivery: Date | null;
    status: AdvanceOrderStatus;
    createdAt: Date;
    customer?: { id: string; name: string };
  }) {
    return {
      id: order.id,
      orderNo: order.orderNo,
      customerId: order.customerId,
      customer: order.customer,
      specs: order.specs,
      karat: order.karat,
      estimatedWeight: order.estimatedWeight != null ? decimalStr(order.estimatedWeight) : null,
      estimatedAmount: decimalStr(order.estimatedAmount),
      advancePaid: decimalStr(order.advancePaid),
      expectedDelivery: order.expectedDelivery?.toISOString().slice(0, 10) ?? null,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };
  }

  async listRepairOrders(query: Record<string, unknown>) {
    const { page, pageSize, skip, take, search, sortDir } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const where: Prisma.RepairOrderWhereInput = {};
    if (search) {
      where.OR = [
        { orderNo: { contains: search } },
        { description: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }
    if (query.status) where.status = query.status as AdvanceOrderStatus;

    const [rows, total] = await Promise.all([
      this.prisma.repairOrder.findMany({
        where,
        skip,
        take,
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: sortDir as Prisma.SortOrder },
      }),
      this.prisma.repairOrder.count({ where }),
    ]);

    return paginatedResult(rows.map((r) => this.formatRepairOrder(r)), total, page, pageSize);
  }

  async getRepairOrder(id: string) {
    const order = await this.prisma.repairOrder.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!order) throw new NotFoundException('Repair order not found');
    return this.formatRepairOrder(order);
  }

  async createRepairOrder(body: unknown, userId?: string) {
    const dto = zodValidate(repairOrderSchema, body);
    const orderNo = await this.numberSeries.nextNumber('REPAIR_ORDER', 'RO');
    const order = await this.prisma.repairOrder.create({
      data: {
        orderNo,
        customerId: dto.customerId,
        description: dto.description,
        estimatedAmount: dto.estimatedAmount,
        advancePaid: dto.advancePaid,
        expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : null,
        status: dto.status,
        createdById: userId,
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    return this.formatRepairOrder(order);
  }

  async updateRepairOrder(id: string, body: unknown, _userId?: string) {
    await this.getRepairOrder(id);
    const dto = zodValidate(repairOrderSchema.partial(), body);
    const order = await this.prisma.repairOrder.update({
      where: { id },
      data: {
        ...dto,
        expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : undefined,
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    return this.formatRepairOrder(order);
  }

  async transitionRepairOrderStatus(id: string, body: unknown, _userId?: string) {
    const { status } = zodValidate(statusTransitionSchema, body);
    const order = await this.prisma.repairOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Repair order not found');
    this.assertTransition(order.status, status);
    const updated = await this.prisma.repairOrder.update({
      where: { id },
      data: { status },
      include: { customer: { select: { id: true, name: true } } },
    });
    return this.formatRepairOrder(updated);
  }

  private formatRepairOrder(order: {
    id: string;
    orderNo: string;
    customerId: string;
    description: string;
    estimatedAmount: Prisma.Decimal;
    advancePaid: Prisma.Decimal;
    expectedDelivery: Date | null;
    status: AdvanceOrderStatus;
    createdAt: Date;
    customer?: { id: string; name: string };
  }) {
    return {
      id: order.id,
      orderNo: order.orderNo,
      customerId: order.customerId,
      customer: order.customer,
      description: order.description,
      estimatedAmount: decimalStr(order.estimatedAmount),
      advancePaid: decimalStr(order.advancePaid),
      expectedDelivery: order.expectedDelivery?.toISOString().slice(0, 10) ?? null,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
