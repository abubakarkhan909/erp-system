import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginatedResult, parsePagination } from '../../common/utils/pagination';
import { startOfDayUtc } from '../../common/utils/date-range';

export type CreateNotificationInput = {
  userId?: string;
  type: string;
  title: string;
  body: string;
  refType?: string;
  refId?: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(input: CreateNotificationInput) {
    const row = await this.prisma.notification.create({
      data: {
        userId: input.userId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
        refType: input.refType ?? null,
        refId: input.refId ?? null,
      },
    });
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      isRead: row.isRead,
      refType: row.refType,
      refId: row.refId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async list(query: Record<string, unknown>, userId?: string) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const where: Prisma.NotificationWhereInput = {};
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }
    if (query.unreadOnly === 'true' || query.unreadOnly === true) {
      where.isRead = false;
    }
    if (query.type) where.type = query.type as string;

    const [rows, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginatedResult(
      rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        type: r.type,
        title: r.title,
        body: r.body,
        isRead: r.isRead,
        refType: r.refType,
        refId: r.refId,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    );
  }

  async markRead(id: string, userId?: string) {
    const row = await this.prisma.notification.findFirst({
      where: {
        id,
        OR: userId ? [{ userId }, { userId: null }] : undefined,
      },
    });
    if (!row) throw new NotFoundException('Notification not found');

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return {
      id: updated.id,
      isRead: updated.isRead,
    };
  }

  async scanAndCreate() {
    const created: string[] = [];
    const today = startOfDayUtc(new Date());
    const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const lowStockProducts = await this.prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE', stockBalance: { isNot: null } },
      include: { stockBalance: true },
    });

    for (const p of lowStockProducts) {
      const sb = p.stockBalance!;
      const isLow =
        sb.onHandQty.lessThan(p.minStockQty) || sb.onHandWeight.lessThan(p.minStockWeight);
      if (!isLow) continue;

      const existing = await this.prisma.notification.findFirst({
        where: {
          type: 'LOW_STOCK',
          refType: 'Product',
          refId: p.id,
          isRead: false,
          createdAt: { gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
        },
      });
      if (existing) continue;

      const n = await this.createNotification({
        type: 'LOW_STOCK',
        title: `Low stock: ${p.name}`,
        body: `SKU ${p.sku} is below minimum stock levels.`,
        refType: 'Product',
        refId: p.id,
      });
      created.push(n.id);
    }

    const pendingInstallments = await this.prisma.installmentSchedule.findMany({
      where: {
        dueDate: { lte: inSevenDays },
        status: { in: ['PENDING', 'PARTIAL', 'LATE'] },
      },
      include: { installmentPlan: { include: { saleInvoice: true } } },
      take: 50,
    });

    for (const s of pendingInstallments) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          type: 'INSTALLMENT_DUE',
          refType: 'InstallmentSchedule',
          refId: s.id,
          isRead: false,
          createdAt: { gte: today },
        },
      });
      if (existing) continue;

      const n = await this.createNotification({
        type: 'INSTALLMENT_DUE',
        title: `Installment due: ${s.installmentPlan.saleInvoice.number}`,
        body: `Installment of ${s.amount.toFixed(3)} OMR due on ${s.dueDate.toISOString().slice(0, 10)}.`,
        refType: 'InstallmentSchedule',
        refId: s.id,
      });
      created.push(n.id);
    }

    const upcomingBills = await this.prisma.utilityBill.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { lte: inSevenDays },
      },
      take: 50,
    });

    for (const b of upcomingBills) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          type: 'UTILITY_BILL',
          refType: 'UtilityBill',
          refId: b.id,
          isRead: false,
          createdAt: { gte: today },
        },
      });
      if (existing) continue;

      const n = await this.createNotification({
        type: 'UTILITY_BILL',
        title: `${b.type} bill due`,
        body: `Bill ${b.billNumber ?? b.id} for ${b.amount.toFixed(3)} OMR due ${b.dueDate.toISOString().slice(0, 10)}.`,
        refType: 'UtilityBill',
        refId: b.id,
      });
      created.push(n.id);
    }

    const lastBackup = await this.prisma.backupJob.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });
    const backupStaleDays = 7;
    const staleThreshold = new Date(today.getTime() - backupStaleDays * 24 * 60 * 60 * 1000);
    if (!lastBackup || lastBackup.createdAt < staleThreshold) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          type: 'BACKUP_REMINDER',
          isRead: false,
          createdAt: { gte: today },
        },
      });
      if (!existing) {
        const n = await this.createNotification({
          type: 'BACKUP_REMINDER',
          title: 'Database backup reminder',
          body: `No successful backup in the last ${backupStaleDays} days. Please create a backup.`,
          refType: 'BackupJob',
          refId: lastBackup?.id,
        });
        created.push(n.id);
      }
    }

    return { scanned: true, createdCount: created.length, notificationIds: created };
  }
}
