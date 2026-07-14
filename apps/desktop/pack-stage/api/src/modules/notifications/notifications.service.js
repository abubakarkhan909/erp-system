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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const date_range_1 = require("../../common/utils/date-range");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(input) {
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
    async list(query, userId) {
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const where = {};
        if (userId) {
            where.OR = [{ userId }, { userId: null }];
        }
        if (query.unreadOnly === 'true' || query.unreadOnly === true) {
            where.isRead = false;
        }
        if (query.type)
            where.type = query.type;
        const [rows, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((r) => ({
            id: r.id,
            userId: r.userId,
            type: r.type,
            title: r.title,
            body: r.body,
            isRead: r.isRead,
            refType: r.refType,
            refId: r.refId,
            createdAt: r.createdAt.toISOString(),
        })), total, page, pageSize);
    }
    async markRead(id, userId) {
        const row = await this.prisma.notification.findFirst({
            where: {
                id,
                OR: userId ? [{ userId }, { userId: null }] : undefined,
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Notification not found');
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
        const created = [];
        const today = (0, date_range_1.startOfDayUtc)(new Date());
        const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const lowStockProducts = await this.prisma.product.findMany({
            where: { deletedAt: null, status: 'ACTIVE', stockBalance: { isNot: null } },
            include: { stockBalance: true },
        });
        for (const p of lowStockProducts) {
            const sb = p.stockBalance;
            const isLow = sb.onHandQty.lessThan(p.minStockQty) || sb.onHandWeight.lessThan(p.minStockWeight);
            if (!isLow)
                continue;
            const existing = await this.prisma.notification.findFirst({
                where: {
                    type: 'LOW_STOCK',
                    refType: 'Product',
                    refId: p.id,
                    isRead: false,
                    createdAt: { gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
                },
            });
            if (existing)
                continue;
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
            if (existing)
                continue;
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
            if (existing)
                continue;
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map