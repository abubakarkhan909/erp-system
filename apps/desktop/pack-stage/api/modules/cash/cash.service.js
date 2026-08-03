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
exports.CashService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
const zod_validate_1 = require("../../common/utils/zod-validate");
const zod_1 = require("zod");
const openSessionSchema = zod_1.z.object({
    sessionDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    openingCash: shared_1.moneySchema,
    notes: zod_1.z.string().max(500).optional().nullable(),
});
const cashMovementSchema = zod_1.z.object({
    type: zod_1.z.enum(['IN', 'OUT']),
    amount: shared_1.moneySchema,
    reason: zod_1.z.string().max(200).optional().nullable(),
    refType: zod_1.z.string().max(50).optional().nullable(),
    refId: zod_1.z.string().max(100).optional().nullable(),
});
const closeSessionSchema = zod_1.z.object({
    closingCash: shared_1.moneySchema,
    notes: zod_1.z.string().max(500).optional().nullable(),
});
let CashService = class CashService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOpenSession() {
        const session = await this.prisma.cashSession.findFirst({
            where: { status: client_1.CashSessionStatus.OPEN },
            orderBy: { openedAt: 'desc' },
            include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } },
        });
        if (!session)
            return null;
        return {
            ...(0, serialize_1.serializeRecord)(session),
            transactions: (0, serialize_1.serializeMany)(session.transactions),
        };
    }
    async openSession(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(openSessionSchema, body);
        const existing = await this.prisma.cashSession.findFirst({
            where: { status: client_1.CashSessionStatus.OPEN },
        });
        if (existing) {
            throw new common_1.BadRequestException('A cash session is already open');
        }
        const session = await this.prisma.cashSession.create({
            data: {
                sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : new Date(),
                openingCash: (0, shared_1.roundMoney)(dto.openingCash),
                status: client_1.CashSessionStatus.OPEN,
                openedById: userId,
                notes: dto.notes ?? null,
            },
        });
        return (0, serialize_1.serializeRecord)(session);
    }
    async cashIn(body, userId) {
        return this.recordMovement({ ...(0, zod_validate_1.zodValidate)(cashMovementSchema, body), type: 'IN' }, userId);
    }
    async cashOut(body, userId) {
        return this.recordMovement({ ...(0, zod_validate_1.zodValidate)(cashMovementSchema, body), type: 'OUT' }, userId);
    }
    async recordMovement(dto, userId) {
        const session = await this.prisma.cashSession.findFirst({
            where: { status: client_1.CashSessionStatus.OPEN },
            orderBy: { openedAt: 'desc' },
        });
        if (!session) {
            throw new common_1.BadRequestException('No open cash session');
        }
        const amount = (0, shared_1.roundMoney)(dto.amount);
        if (parseFloat(amount) <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const tx = await this.prisma.cashTransaction.create({
            data: {
                cashSessionId: session.id,
                type: dto.type,
                amount,
                reason: dto.reason ?? null,
                refType: dto.refType ?? null,
                refId: dto.refId ?? null,
                createdById: userId,
            },
        });
        return (0, serialize_1.serializeRecord)(tx);
    }
    async closeSession(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(closeSessionSchema, body);
        const session = await this.prisma.cashSession.findFirst({
            where: { status: client_1.CashSessionStatus.OPEN },
            include: { transactions: true },
            orderBy: { openedAt: 'desc' },
        });
        if (!session) {
            throw new common_1.NotFoundException('No open cash session');
        }
        let expected = (0, pagination_1.decimalStr)(session.openingCash);
        for (const t of session.transactions) {
            const amt = (0, pagination_1.decimalStr)(t.amount);
            expected =
                t.type === 'IN' ? (0, shared_1.addMoney)(expected, amt) : (0, shared_1.subMoney)(expected, amt);
        }
        const closingCash = (0, shared_1.roundMoney)(dto.closingCash);
        const difference = (0, shared_1.subMoney)(closingCash, expected);
        const updated = await this.prisma.cashSession.update({
            where: { id: session.id },
            data: {
                status: client_1.CashSessionStatus.CLOSED,
                closingCash,
                expectedCash: expected,
                difference,
                closedById: userId,
                closedAt: new Date(),
                notes: dto.notes ?? session.notes,
            },
        });
        return (0, serialize_1.serializeRecord)(updated);
    }
    async listSessions() {
        const sessions = await this.prisma.cashSession.findMany({
            orderBy: { openedAt: 'desc' },
            take: 30,
        });
        return (0, serialize_1.serializeMany)(sessions);
    }
};
exports.CashService = CashService;
exports.CashService = CashService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CashService);
//# sourceMappingURL=cash.service.js.map