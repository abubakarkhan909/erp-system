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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const zod_validate_1 = require("../../common/utils/zod-validate");
const serialize_1 = require("../../common/utils/serialize");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, pageSize, skip, take, search, sortBy, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
                { tradeLicense: { contains: search } },
            ];
        }
        const orderBy = {};
        const allowedSort = ['name', 'phone', 'createdAt', 'currentBalance'];
        const field = allowedSort.includes(sortBy)
            ? sortBy
            : 'createdAt';
        orderBy[field] = sortDir;
        const [rows, total] = await Promise.all([
            this.prisma.supplier.findMany({ where, skip, take, orderBy }),
            this.prisma.supplier.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async findOne(id) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id, deletedAt: null },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return (0, serialize_1.serializeRecord)(supplier);
    }
    async create(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(shared_1.supplierSchema, body);
        const openingBalance = dto.openingBalance ?? '0.000';
        const supplier = await this.prisma.supplier.create({
            data: {
                name: dto.name,
                phone: dto.phone ?? null,
                email: dto.email || null,
                address: dto.address ?? null,
                tradeLicense: dto.tradeLicense ?? null,
                openingBalance,
                currentBalance: openingBalance,
                notes: dto.notes ?? null,
                createdById: userId,
                updatedById: userId,
            },
        });
        return (0, serialize_1.serializeRecord)(supplier);
    }
    async update(id, body, userId) {
        await this.findOne(id);
        const dto = (0, zod_validate_1.zodValidate)(shared_1.supplierSchema.partial(), body);
        const supplier = await this.prisma.supplier.update({
            where: { id },
            data: {
                ...dto,
                email: dto.email === '' ? null : dto.email,
                updatedById: userId,
            },
        });
        return (0, serialize_1.serializeRecord)(supplier);
    }
    async remove(id, userId) {
        await this.findOne(id);
        const supplier = await this.prisma.supplier.update({
            where: { id },
            data: { deletedAt: new Date(), updatedById: userId },
        });
        return (0, serialize_1.serializeRecord)(supplier);
    }
    async getLedger(id) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id, deletedAt: null },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        const [purchasesAgg, paymentsAgg, recentPurchases] = await Promise.all([
            this.prisma.purchaseInvoice.aggregate({
                where: { supplierId: id, deletedAt: null, status: 'POSTED' },
                _sum: { total: true, paid: true, balance: true },
                _count: true,
            }),
            this.prisma.purchasePayment.aggregate({
                where: { purchaseInvoice: { supplierId: id, deletedAt: null } },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.purchaseInvoice.findMany({
                where: { supplierId: id, deletedAt: null },
                orderBy: { invoiceDate: 'desc' },
                take: 10,
                select: {
                    id: true,
                    number: true,
                    invoiceDate: true,
                    status: true,
                    total: true,
                    paid: true,
                    balance: true,
                },
            }),
        ]);
        return {
            supplierId: id,
            currentBalance: (0, pagination_1.decimalStr)(supplier.currentBalance),
            openingBalance: (0, pagination_1.decimalStr)(supplier.openingBalance),
            purchases: {
                count: purchasesAgg._count,
                total: (0, pagination_1.decimalStr)(purchasesAgg._sum.total),
                paid: (0, pagination_1.decimalStr)(purchasesAgg._sum.paid),
                balance: (0, pagination_1.decimalStr)(purchasesAgg._sum.balance),
            },
            payments: {
                count: paymentsAgg._count,
                total: (0, pagination_1.decimalStr)(paymentsAgg._sum.amount),
            },
            recentPurchases: recentPurchases.map((p) => ({
                ...p,
                total: (0, pagination_1.decimalStr)(p.total),
                paid: (0, pagination_1.decimalStr)(p.paid),
                balance: (0, pagination_1.decimalStr)(p.balance),
            })),
        };
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map