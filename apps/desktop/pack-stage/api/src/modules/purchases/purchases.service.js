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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const number_series_service_1 = require("../number-series/number-series.service");
const inventory_service_1 = require("../inventory/inventory.service");
const accounting_service_1 = require("../accounting/accounting.service");
const accounting_constants_1 = require("../accounting/accounting.constants");
const pagination_1 = require("../../common/utils/pagination");
const pagination_2 = require("../../common/utils/pagination");
const serialize_1 = require("../../common/utils/serialize");
const zod_validate_1 = require("../../common/utils/zod-validate");
const zod_1 = require("zod");
const purchaseItemSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    quantity: zod_1.z.coerce.number().positive(),
    grossWeight: shared_1.moneySchema.default('0.000'),
    netWeight: shared_1.moneySchema.default('0.000'),
    karat: zod_1.z.nativeEnum(client_1.GoldKarat).optional().nullable(),
    unitCost: shared_1.moneySchema.default('0.000'),
    lineDiscount: shared_1.moneySchema.default('0.000'),
    vatRate: shared_1.moneySchema.default('5.000'),
});
const purchaseInvoiceSchema = zod_1.z.object({
    supplierId: zod_1.z.string().cuid(),
    invoiceDate: zod_1.z.string().or(zod_1.z.coerce.date()).optional(),
    discount: shared_1.moneySchema.default('0.000'),
    notes: zod_1.z.string().max(2000).optional().nullable(),
    items: zod_1.z.array(purchaseItemSchema).min(1),
    payments: zod_1.z.array(shared_1.paymentRowSchema).optional(),
});
const updatePurchaseSchema = purchaseInvoiceSchema.partial().extend({
    items: purchaseInvoiceSchema.shape.items.optional(),
});
let PurchasesService = class PurchasesService {
    prisma;
    numberSeries;
    inventory;
    accounting;
    constructor(prisma, numberSeries, inventory, accounting) {
        this.prisma = prisma;
        this.numberSeries = numberSeries;
        this.inventory = inventory;
        this.accounting = accounting;
    }
    async findAll(query) {
        const { page, pageSize, skip, take, search, sortBy, sortDir } = (0, pagination_2.parsePagination)(query);
        const where = { deletedAt: null };
        if (query.status)
            where.status = query.status;
        if (query.supplierId)
            where.supplierId = String(query.supplierId);
        if (search) {
            where.OR = [{ number: { contains: search } }, { notes: { contains: search } }];
        }
        const orderBy = {};
        const allowed = ['invoiceDate', 'number', 'total', 'createdAt'];
        const field = allowed.includes(sortBy)
            ? sortBy
            : 'createdAt';
        orderBy[field] = sortDir;
        const [rows, total] = await Promise.all([
            this.prisma.purchaseInvoice.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    supplier: { select: { id: true, name: true, phone: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.purchaseInvoice.count({ where }),
        ]);
        return (0, pagination_2.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async findOne(id) {
        const invoice = await this.prisma.purchaseInvoice.findFirst({
            where: { id, deletedAt: null },
            include: {
                supplier: true,
                items: { include: { product: { select: { id: true, sku: true, name: true } } } },
                payments: true,
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Purchase invoice not found');
        return this.serializeInvoice(invoice);
    }
    async createDraft(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(purchaseInvoiceSchema, body);
        const totals = this.calcInvoiceTotals(dto.items, dto.discount ?? '0.000');
        const invoice = await this.prisma.purchaseInvoice.create({
            data: {
                number: `P-DRAFT-${Date.now()}`,
                supplierId: dto.supplierId,
                invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
                status: client_1.DocumentStatus.DRAFT,
                subtotal: totals.subtotal,
                discount: dto.discount ?? '0.000',
                taxable: totals.taxable,
                vatAmount: totals.vatAmount,
                total: totals.total,
                paid: '0.000',
                balance: totals.total,
                notes: dto.notes ?? null,
                createdById: userId,
                updatedById: userId,
                items: {
                    create: totals.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        grossWeight: item.grossWeight,
                        netWeight: item.netWeight,
                        karat: item.karat ?? null,
                        unitCost: item.unitCost,
                        lineDiscount: item.lineDiscount,
                        lineNet: item.lineNet,
                        vatRate: item.vatRate,
                        vatAmount: item.vatAmount,
                        lineTotal: item.lineTotal,
                    })),
                },
            },
            include: { items: true, supplier: true },
        });
        return this.serializeInvoice(invoice);
    }
    async updateDraft(id, body, userId) {
        const existing = await this.prisma.purchaseInvoice.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing)
            throw new common_1.NotFoundException('Purchase invoice not found');
        if (existing.status !== client_1.DocumentStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft invoices can be updated');
        }
        const dto = (0, zod_validate_1.zodValidate)(updatePurchaseSchema, body);
        const discount = dto.discount ?? (0, pagination_1.decimalStr)(existing.discount);
        const totals = dto.items
            ? this.calcInvoiceTotals(dto.items, discount)
            : {
                subtotal: (0, pagination_1.decimalStr)(existing.subtotal),
                taxable: (0, pagination_1.decimalStr)(existing.taxable),
                vatAmount: (0, pagination_1.decimalStr)(existing.vatAmount),
                total: (0, pagination_1.decimalStr)(existing.total),
                items: [],
            };
        const invoice = await this.prisma.$transaction(async (tx) => {
            if (dto.items) {
                await tx.purchaseInvoiceItem.deleteMany({ where: { purchaseInvoiceId: id } });
            }
            return tx.purchaseInvoice.update({
                where: { id },
                data: {
                    supplierId: dto.supplierId,
                    invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
                    discount,
                    subtotal: totals.subtotal,
                    taxable: totals.taxable,
                    vatAmount: totals.vatAmount,
                    total: totals.total,
                    balance: totals.total,
                    notes: dto.notes !== undefined ? dto.notes : undefined,
                    updatedById: userId,
                    ...(dto.items
                        ? {
                            items: {
                                create: totals.items.map((item) => ({
                                    productId: item.productId,
                                    quantity: item.quantity,
                                    grossWeight: item.grossWeight,
                                    netWeight: item.netWeight,
                                    karat: item.karat ?? null,
                                    unitCost: item.unitCost,
                                    lineDiscount: item.lineDiscount,
                                    lineNet: item.lineNet,
                                    vatRate: item.vatRate,
                                    vatAmount: item.vatAmount,
                                    lineTotal: item.lineTotal,
                                })),
                            },
                        }
                        : {}),
                },
                include: {
                    items: { include: { product: { select: { id: true, sku: true, name: true } } } },
                    supplier: true,
                    payments: true,
                },
            });
        });
        return this.serializeInvoice(invoice);
    }
    async post(id, body, userId) {
        const paymentsSchema = zod_1.z.object({
            payments: zod_1.z.array(shared_1.paymentRowSchema).optional(),
        });
        const { payments: paymentRows } = (0, zod_validate_1.zodValidate)(paymentsSchema, body ?? {});
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.purchaseInvoice.findFirst({
                where: { id, deletedAt: null },
                include: { items: true },
            });
            if (!invoice)
                throw new common_1.NotFoundException('Purchase invoice not found');
            if (invoice.status !== client_1.DocumentStatus.DRAFT) {
                throw new common_1.BadRequestException('Invoice already posted or voided');
            }
            const number = await this.numberSeries.nextNumber('PURCHASE', 'PI', tx);
            let paidTotal = '0.000';
            const payments = paymentRows ?? [];
            for (const p of payments) {
                paidTotal = (0, shared_1.addMoney)(paidTotal, p.amount);
                await tx.purchasePayment.create({
                    data: {
                        purchaseInvoiceId: id,
                        method: p.method,
                        amount: (0, shared_1.roundMoney)(p.amount),
                        bankAccountId: p.bankAccountId ?? null,
                        reference: p.reference ?? null,
                        chequeNo: p.chequeNo ?? null,
                        idempotencyKey: p.idempotencyKey ?? null,
                        createdById: userId,
                    },
                });
                if (p.method === client_1.PaymentMethod.CASH) {
                    await this.recordCashOut(tx, p.amount, 'PURCHASE', id, userId);
                }
                if (p.bankAccountId) {
                    await tx.bankAccount.update({
                        where: { id: p.bankAccountId },
                        data: { currentBalance: { decrement: (0, shared_1.roundMoney)(p.amount) } },
                    });
                    await tx.bankTransaction.create({
                        data: {
                            bankAccountId: p.bankAccountId,
                            type: 'WITHDRAW',
                            amount: (0, shared_1.roundMoney)(p.amount),
                            reference: p.reference ?? number,
                            memo: `Purchase ${number}`,
                            txnDate: invoice.invoiceDate,
                            createdById: userId,
                        },
                    });
                }
            }
            const total = (0, pagination_1.decimalStr)(invoice.total);
            const balance = (0, shared_1.roundMoney)((0, shared_1.subMoney)(total, paidTotal));
            if (parseFloat(balance) < -0.001) {
                throw new common_1.BadRequestException('Payments exceed invoice total');
            }
            let inventoryTotal = '0.000';
            for (const item of invoice.items) {
                await this.inventory.adjustStock(tx, {
                    productId: item.productId,
                    type: 'PURCHASE',
                    qty: (0, pagination_1.decimalStr)(item.quantity),
                    weight: (0, pagination_1.decimalStr)(item.netWeight),
                    refType: 'PURCHASE_INVOICE',
                    refId: id,
                    createdById: userId,
                });
                inventoryTotal = (0, shared_1.addMoney)(inventoryTotal, (0, pagination_1.decimalStr)(item.lineNet));
            }
            await tx.supplier.update({
                where: { id: invoice.supplierId },
                data: {
                    currentBalance: { increment: balance },
                },
            });
            await this.postPurchaseJournal(tx, {
                invoiceId: id,
                invoiceNumber: number,
                supplierId: invoice.supplierId,
                total,
                taxable: (0, pagination_1.decimalStr)(invoice.taxable),
                vatAmount: (0, pagination_1.decimalStr)(invoice.vatAmount),
                inventoryTotal,
                paidTotal,
                balance,
                payments,
                entryDate: invoice.invoiceDate,
                userId,
            });
            const updated = await tx.purchaseInvoice.update({
                where: { id },
                data: {
                    number,
                    status: client_1.DocumentStatus.POSTED,
                    paid: paidTotal,
                    balance,
                    postedAt: new Date(),
                    updatedById: userId,
                },
                include: {
                    items: { include: { product: { select: { id: true, sku: true, name: true } } } },
                    supplier: true,
                    payments: true,
                },
            });
            return this.serializeInvoice(updated);
        });
    }
    async voidPosted(id, userId) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.purchaseInvoice.findFirst({
                where: { id, deletedAt: null },
                include: { items: true, payments: true },
            });
            if (!invoice)
                throw new common_1.NotFoundException('Purchase invoice not found');
            if (invoice.status !== client_1.DocumentStatus.POSTED) {
                throw new common_1.BadRequestException('Only posted invoices can be voided');
            }
            for (const item of invoice.items) {
                await this.inventory.adjustStock(tx, {
                    productId: item.productId,
                    type: 'PURCHASE_RETURN',
                    qty: (0, pagination_1.decimalStr)(item.quantity),
                    weight: (0, pagination_1.decimalStr)(item.netWeight),
                    refType: 'PURCHASE_VOID',
                    refId: id,
                    createdById: userId,
                });
            }
            const balance = (0, pagination_1.decimalStr)(invoice.balance);
            await tx.supplier.update({
                where: { id: invoice.supplierId },
                data: { currentBalance: { decrement: balance } },
            });
            for (const p of invoice.payments) {
                if (p.method === client_1.PaymentMethod.CASH) {
                    await this.recordCashIn(tx, (0, pagination_1.decimalStr)(p.amount), 'PURCHASE_VOID', id, userId);
                }
                if (p.bankAccountId) {
                    await tx.bankAccount.update({
                        where: { id: p.bankAccountId },
                        data: { currentBalance: { increment: (0, pagination_1.decimalStr)(p.amount) } },
                    });
                }
            }
            await this.accounting.reverseJournalBySource(tx, 'PURCHASE_INVOICE', id, userId);
            const updated = await tx.purchaseInvoice.update({
                where: { id },
                data: {
                    status: client_1.DocumentStatus.VOID,
                    voidedAt: new Date(),
                    updatedById: userId,
                },
                include: {
                    items: { include: { product: { select: { id: true, sku: true, name: true } } } },
                    supplier: true,
                    payments: true,
                },
            });
            return this.serializeInvoice(updated);
        });
    }
    calcInvoiceTotals(items, headerDiscount) {
        const computed = items.map((item) => {
            const unitCost = item.unitCost ?? '0.000';
            const lineDiscount = item.lineDiscount ?? '0.000';
            const vatRate = item.vatRate ?? '5.000';
            const grossLine = (0, shared_1.roundMoney)((parseFloat(unitCost) * parseFloat(String(item.quantity))).toFixed(3));
            const lineNet = (0, shared_1.roundMoney)((0, shared_1.subMoney)(grossLine, lineDiscount));
            const { vat, gross } = (0, shared_1.calcVat)(lineNet, vatRate);
            return {
                ...item,
                grossWeight: item.grossWeight ?? '0.000',
                netWeight: item.netWeight ?? '0.000',
                unitCost,
                lineDiscount,
                vatRate,
                lineNet,
                vatAmount: vat,
                lineTotal: gross,
            };
        });
        const subtotal = computed.reduce((s, i) => (0, shared_1.addMoney)(s, i.lineNet), '0.000');
        const vatBeforeDiscount = computed.reduce((s, i) => (0, shared_1.addMoney)(s, i.vatAmount), '0.000');
        const discount = (0, shared_1.roundMoney)(headerDiscount);
        const taxable = (0, shared_1.roundMoney)((0, shared_1.subMoney)(subtotal, discount));
        const vatAmount = parseFloat(subtotal) > 0
            ? (0, shared_1.roundMoney)(((parseFloat(vatBeforeDiscount) * parseFloat(taxable)) /
                parseFloat(subtotal)).toFixed(3))
            : '0.000';
        const total = (0, shared_1.addMoney)(taxable, vatAmount);
        return { items: computed, subtotal: (0, shared_1.roundMoney)(subtotal), taxable, vatAmount, total };
    }
    async postPurchaseJournal(tx, ctx) {
        const lines = [
            {
                accountCode: accounting_constants_1.ACCOUNT_CODES.INVENTORY,
                debit: ctx.inventoryTotal,
                credit: '0.000',
            },
        ];
        if (parseFloat(ctx.vatAmount) > 0) {
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.INPUT_VAT,
                debit: ctx.vatAmount,
                credit: '0.000',
            });
        }
        let cashTotal = '0.000';
        let bankTotal = '0.000';
        for (const p of ctx.payments) {
            if (p.method === client_1.PaymentMethod.CASH)
                cashTotal = (0, shared_1.addMoney)(cashTotal, p.amount);
            else
                bankTotal = (0, shared_1.addMoney)(bankTotal, p.amount);
        }
        if (parseFloat(cashTotal) > 0) {
            lines.push({ accountCode: accounting_constants_1.ACCOUNT_CODES.CASH, debit: '0.000', credit: cashTotal });
        }
        if (parseFloat(bankTotal) > 0) {
            lines.push({ accountCode: accounting_constants_1.ACCOUNT_CODES.BANK, debit: '0.000', credit: bankTotal });
        }
        if (parseFloat(ctx.balance) > 0) {
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.AP,
                debit: '0.000',
                credit: ctx.balance,
                partyType: 'SUPPLIER',
                partyId: ctx.supplierId,
            });
        }
        await this.accounting.postJournal(tx, {
            entryDate: ctx.entryDate,
            memo: `Purchase invoice ${ctx.invoiceNumber}`,
            sourceType: 'PURCHASE_INVOICE',
            sourceId: ctx.invoiceId,
            createdById: ctx.userId,
            lines,
        });
    }
    async recordCashOut(tx, amount, refType, refId, userId) {
        const openSession = await tx.cashSession.findFirst({
            where: { status: 'OPEN' },
            orderBy: { openedAt: 'desc' },
        });
        await tx.cashTransaction.create({
            data: {
                cashSessionId: openSession?.id ?? null,
                type: 'OUT',
                amount: (0, shared_1.roundMoney)(amount),
                reason: refType,
                refType,
                refId,
                createdById: userId,
            },
        });
    }
    async recordCashIn(tx, amount, refType, refId, userId) {
        const openSession = await tx.cashSession.findFirst({
            where: { status: 'OPEN' },
            orderBy: { openedAt: 'desc' },
        });
        await tx.cashTransaction.create({
            data: {
                cashSessionId: openSession?.id ?? null,
                type: 'IN',
                amount: (0, shared_1.roundMoney)(amount),
                reason: refType,
                refType,
                refId,
                createdById: userId,
            },
        });
    }
    serializeInvoice(invoice) {
        const base = (0, serialize_1.serializeRecord)(invoice);
        if (Array.isArray(invoice.items)) {
            base.items = (0, serialize_1.serializeMany)(invoice.items);
        }
        if (Array.isArray(invoice.payments)) {
            base.payments = (0, serialize_1.serializeMany)(invoice.payments);
        }
        return base;
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        number_series_service_1.NumberSeriesService,
        inventory_service_1.InventoryService,
        accounting_service_1.AccountingService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map