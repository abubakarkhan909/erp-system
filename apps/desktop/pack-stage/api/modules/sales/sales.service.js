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
exports.SalesService = void 0;
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
const updateSaleSchema = shared_1.saleInvoiceSchema.partial().extend({
    items: shared_1.saleInvoiceSchema.shape.items.optional(),
});
let SalesService = class SalesService {
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
        if (query.customerId)
            where.customerId = String(query.customerId);
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
            this.prisma.saleInvoice.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    customer: { select: { id: true, name: true, phone: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.saleInvoice.count({ where }),
        ]);
        return (0, pagination_2.paginatedResult)(rows.map((row) => {
            const base = (0, serialize_1.serializeRecord)(row);
            const total = parseFloat((0, pagination_1.decimalStr)(row.total));
            const paid = parseFloat((0, pagination_1.decimalStr)(row.paid));
            const balance = parseFloat((0, pagination_1.decimalStr)(row.balance));
            let paymentStatus = 'N/A';
            if (row.status === client_1.DocumentStatus.POSTED) {
                if (balance <= 0.001 || paid + 0.001 >= total)
                    paymentStatus = 'PAID';
                else if (paid > 0.001)
                    paymentStatus = 'PARTIAL';
                else
                    paymentStatus = 'UNPAID';
            }
            return { ...base, paymentStatus };
        }), total, page, pageSize);
    }
    async findOne(id) {
        const invoice = await this.prisma.saleInvoice.findFirst({
            where: { id, deletedAt: null },
            include: {
                customer: true,
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                sku: true,
                                name: true,
                                netWeight: true,
                                grossWeight: true,
                                sellingPrice: true,
                                makingCharges: true,
                                stoneCharges: true,
                                purityKarat: true,
                                vatRate: true,
                                stockBalance: true,
                            },
                        },
                    },
                },
                payments: true,
                installment: {
                    include: {
                        schedules: { orderBy: { dueDate: 'asc' } },
                    },
                },
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Sale invoice not found');
        return this.serializeInvoice(invoice);
    }
    async createDraft(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(shared_1.saleInvoiceSchema, body);
        const totals = this.calcInvoiceTotals(dto.items, dto.discount ?? '0.000');
        const invoice = await this.prisma.saleInvoice.create({
            data: {
                number: `DRAFT-${Date.now()}`,
                customerId: dto.customerId ?? null,
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
                        stoneWeight: item.stoneWeight,
                        karat: item.karat ?? null,
                        goldRateSnapshot: item.goldRateSnapshot,
                        unitPrice: item.unitPrice,
                        makingCharges: item.makingCharges,
                        stoneCharges: item.stoneCharges,
                        lineDiscount: item.lineDiscount,
                        lineNet: item.lineNet,
                        vatRate: item.vatRate,
                        vatAmount: item.vatAmount,
                        lineTotal: item.lineTotal,
                    })),
                },
            },
            include: { items: true, customer: true },
        });
        return this.serializeInvoice(invoice);
    }
    async updateDraft(id, body, userId) {
        const existing = await this.prisma.saleInvoice.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing)
            throw new common_1.NotFoundException('Sale invoice not found');
        if (existing.status !== client_1.DocumentStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft invoices can be updated');
        }
        const dto = (0, zod_validate_1.zodValidate)(updateSaleSchema, body);
        const items = dto.items ?? [];
        const discount = dto.discount ?? (0, pagination_1.decimalStr)(existing.discount);
        const totals = dto.items
            ? this.calcInvoiceTotals(items, discount)
            : {
                subtotal: (0, pagination_1.decimalStr)(existing.subtotal),
                taxable: (0, pagination_1.decimalStr)(existing.taxable),
                vatAmount: (0, pagination_1.decimalStr)(existing.vatAmount),
                total: (0, pagination_1.decimalStr)(existing.total),
                items: [],
            };
        const invoice = await this.prisma.$transaction(async (tx) => {
            if (dto.items) {
                await tx.saleInvoiceItem.deleteMany({ where: { saleInvoiceId: id } });
            }
            return tx.saleInvoice.update({
                where: { id },
                data: {
                    customerId: dto.customerId !== undefined ? dto.customerId : undefined,
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
                                    stoneWeight: item.stoneWeight,
                                    karat: item.karat ?? null,
                                    goldRateSnapshot: item.goldRateSnapshot,
                                    unitPrice: item.unitPrice,
                                    makingCharges: item.makingCharges,
                                    stoneCharges: item.stoneCharges,
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
                    customer: true,
                    payments: true,
                },
            });
        });
        return this.serializeInvoice(invoice);
    }
    async post(id, body, userId) {
        const paymentsSchema = zod_1.z.object({
            payments: zod_1.z
                .array(zod_1.z.object({
                method: zod_1.z.nativeEnum(client_1.PaymentMethod),
                amount: zod_1.z.string(),
                bankAccountId: zod_1.z.string().optional().nullable(),
                reference: zod_1.z.string().optional().nullable(),
                chequeNo: zod_1.z.string().optional().nullable(),
                chequeBankName: zod_1.z.string().optional().nullable(),
                chequeDueDate: zod_1.z.string().optional().nullable(),
                idempotencyKey: zod_1.z.string().optional().nullable(),
            }))
                .optional(),
        });
        const { payments: paymentRows } = (0, zod_validate_1.zodValidate)(paymentsSchema, body ?? {});
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.saleInvoice.findFirst({
                where: { id, deletedAt: null },
                include: { items: { include: { product: true } } },
            });
            if (!invoice)
                throw new common_1.NotFoundException('Sale invoice not found');
            if (invoice.status !== client_1.DocumentStatus.DRAFT) {
                throw new common_1.BadRequestException('Invoice already posted or voided');
            }
            if (!invoice.items.length) {
                throw new common_1.BadRequestException('Invoice has no line items');
            }
            const totals = this.calcInvoiceTotals(invoice.items.map((item) => ({
                productId: item.productId,
                quantity: Number(item.quantity),
                grossWeight: (0, pagination_1.decimalStr)(item.grossWeight),
                netWeight: (0, pagination_1.decimalStr)(item.netWeight),
                stoneWeight: (0, pagination_1.decimalStr)(item.stoneWeight),
                karat: item.karat,
                goldRateSnapshot: (0, pagination_1.decimalStr)(item.goldRateSnapshot),
                unitPrice: (0, pagination_1.decimalStr)(item.unitPrice),
                makingCharges: (0, pagination_1.decimalStr)(item.makingCharges),
                stoneCharges: (0, pagination_1.decimalStr)(item.stoneCharges),
                lineDiscount: (0, pagination_1.decimalStr)(item.lineDiscount),
                vatRate: (0, pagination_1.decimalStr)(item.vatRate),
            })), (0, pagination_1.decimalStr)(invoice.discount));
            if (parseFloat(totals.total) <= 0) {
                throw new common_1.BadRequestException('Invoice total is 0.000 OMR. For jewelry enter Net Weight and Unit Price (or gold rate). ' +
                    'For piece sales leave weight at 0 and set Qty × Unit Price.');
            }
            for (let i = 0; i < invoice.items.length; i++) {
                const match = invoice.items[i];
                const computed = totals.items[i];
                if (!match || !computed)
                    continue;
                await tx.saleInvoiceItem.update({
                    where: { id: match.id },
                    data: {
                        lineNet: computed.lineNet,
                        vatAmount: computed.vatAmount,
                        lineTotal: computed.lineTotal,
                    },
                });
            }
            await tx.saleInvoice.update({
                where: { id },
                data: {
                    subtotal: totals.subtotal,
                    taxable: totals.taxable,
                    vatAmount: totals.vatAmount,
                    total: totals.total,
                },
            });
            const number = await this.numberSeries.nextNumber('SALE', 'INV', tx);
            let paidTotal = '0.000';
            const payments = paymentRows ?? [];
            for (const p of payments) {
                paidTotal = (0, shared_1.addMoney)(paidTotal, p.amount);
            }
            const total = totals.total;
            const balance = (0, shared_1.roundMoney)((0, shared_1.subMoney)(total, paidTotal));
            if (parseFloat(balance) < -0.001) {
                throw new common_1.BadRequestException(`Payments exceed invoice total (paid ${paidTotal} OMR, invoice ${total} OMR)`);
            }
            if (parseFloat(balance) > 0.001 && !invoice.customerId) {
                throw new common_1.BadRequestException('Partial or credit sales require a customer so the outstanding balance can be tracked. ' +
                    'Select a customer, or pay the full invoice total.');
            }
            for (const item of invoice.items) {
                const stock = await tx.stockBalance.findUnique({ where: { productId: item.productId } });
                const onHandQty = parseFloat((0, pagination_1.decimalStr)(stock?.onHandQty ?? '0'));
                const onHandWeight = parseFloat((0, pagination_1.decimalStr)(stock?.onHandWeight ?? '0'));
                const needQty = parseFloat((0, pagination_1.decimalStr)(item.quantity));
                const needWeight = parseFloat((0, pagination_1.decimalStr)(item.netWeight));
                if (needQty > onHandQty + 0.0005) {
                    throw new common_1.BadRequestException(`Insufficient stock for ${item.product.sku} — ${item.product.name}: ` +
                        `need qty ${needQty}, available ${onHandQty}`);
                }
                if (needWeight > 0 && needWeight > onHandWeight + 0.0005) {
                    throw new common_1.BadRequestException(`Insufficient weight stock for ${item.product.sku} — ${item.product.name}: ` +
                        `need ${needWeight} g, available ${onHandWeight} g`);
                }
            }
            for (const p of payments) {
                if (parseFloat(p.amount) <= 0)
                    continue;
                await tx.salePayment.create({
                    data: {
                        saleInvoiceId: id,
                        method: p.method,
                        amount: (0, shared_1.roundMoney)(p.amount),
                        bankAccountId: p.bankAccountId ?? null,
                        reference: p.reference ?? null,
                        chequeNo: p.chequeNo ?? null,
                        chequeBankName: p.chequeBankName ?? null,
                        chequeDueDate: p.chequeDueDate ? new Date(p.chequeDueDate) : null,
                        idempotencyKey: p.idempotencyKey ?? null,
                        createdById: userId,
                    },
                });
                if (p.method === client_1.PaymentMethod.CASH) {
                    await this.recordCashMovement(tx, p.amount, 'SALE', id, userId);
                }
                if ((p.method === client_1.PaymentMethod.BANK_TRANSFER ||
                    p.method === client_1.PaymentMethod.CARD ||
                    p.method === client_1.PaymentMethod.CHEQUE) &&
                    p.bankAccountId) {
                    await tx.bankAccount.update({
                        where: { id: p.bankAccountId },
                        data: { currentBalance: { increment: (0, shared_1.roundMoney)(p.amount) } },
                    });
                    await tx.bankTransaction.create({
                        data: {
                            bankAccountId: p.bankAccountId,
                            type: 'DEPOSIT',
                            amount: (0, shared_1.roundMoney)(p.amount),
                            reference: p.reference ?? number,
                            memo: `Sale ${number}`,
                            txnDate: invoice.invoiceDate,
                            createdById: userId,
                        },
                    });
                }
            }
            let cogsTotal = '0.000';
            for (const item of invoice.items) {
                await this.inventory.adjustStock(tx, {
                    productId: item.productId,
                    type: 'SALE',
                    qty: (0, pagination_1.decimalStr)(item.quantity),
                    weight: (0, pagination_1.decimalStr)(item.netWeight),
                    refType: 'SALE_INVOICE',
                    refId: id,
                    createdById: userId,
                });
                const unitCost = (0, pagination_1.decimalStr)(item.product.purchasePrice);
                const lineCogs = (0, shared_1.roundMoney)((parseFloat(unitCost) * parseFloat((0, pagination_1.decimalStr)(item.quantity))).toFixed(3));
                cogsTotal = (0, shared_1.addMoney)(cogsTotal, lineCogs);
            }
            if (invoice.customerId && parseFloat(balance) > 0) {
                await tx.customer.update({
                    where: { id: invoice.customerId },
                    data: { currentBalance: { increment: balance } },
                });
            }
            await this.postSaleJournal(tx, {
                invoiceId: id,
                invoiceNumber: number,
                customerId: invoice.customerId,
                total,
                taxable: totals.taxable,
                vatAmount: totals.vatAmount,
                paidTotal,
                balance,
                payments: payments.filter((p) => parseFloat(p.amount) > 0),
                cogsTotal,
                entryDate: invoice.invoiceDate,
                userId,
            });
            const updated = await tx.saleInvoice.update({
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
                    customer: true,
                    payments: true,
                },
            });
            return this.serializeInvoice(updated);
        });
    }
    async deleteDraft(id, userId) {
        const existing = await this.prisma.saleInvoice.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing)
            throw new common_1.NotFoundException('Sale invoice not found');
        if (existing.status !== client_1.DocumentStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft invoices can be deleted');
        }
        await this.prisma.saleInvoice.update({
            where: { id },
            data: { deletedAt: new Date(), updatedById: userId },
        });
        return { deleted: true };
    }
    async voidPosted(id, userId) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.saleInvoice.findFirst({
                where: { id, deletedAt: null },
                include: { items: true, payments: true },
            });
            if (!invoice)
                throw new common_1.NotFoundException('Sale invoice not found');
            if (invoice.status !== client_1.DocumentStatus.POSTED) {
                throw new common_1.BadRequestException('Only posted invoices can be voided');
            }
            for (const item of invoice.items) {
                await this.inventory.adjustStock(tx, {
                    productId: item.productId,
                    type: 'SALE_RETURN',
                    qty: (0, pagination_1.decimalStr)(item.quantity),
                    weight: (0, pagination_1.decimalStr)(item.netWeight),
                    refType: 'SALE_VOID',
                    refId: id,
                    createdById: userId,
                });
            }
            const balance = (0, pagination_1.decimalStr)(invoice.balance);
            if (invoice.customerId && parseFloat(balance) > 0) {
                await tx.customer.update({
                    where: { id: invoice.customerId },
                    data: { currentBalance: { decrement: balance } },
                });
            }
            for (const p of invoice.payments) {
                if (p.method === client_1.PaymentMethod.CASH) {
                    await this.recordCashMovement(tx, (0, shared_1.roundMoney)(`-${(0, pagination_1.decimalStr)(p.amount)}`), 'SALE_VOID', id, userId);
                }
                if (p.bankAccountId) {
                    await tx.bankAccount.update({
                        where: { id: p.bankAccountId },
                        data: { currentBalance: { decrement: (0, pagination_1.decimalStr)(p.amount) } },
                    });
                }
            }
            await this.accounting.reverseJournalBySource(tx, 'SALE_INVOICE', id, userId);
            const updated = await tx.saleInvoice.update({
                where: { id },
                data: {
                    status: client_1.DocumentStatus.VOID,
                    voidedAt: new Date(),
                    updatedById: userId,
                },
                include: {
                    items: { include: { product: { select: { id: true, sku: true, name: true } } } },
                    customer: true,
                    payments: true,
                },
            });
            return this.serializeInvoice(updated);
        });
    }
    calcInvoiceTotals(items, headerDiscount) {
        const computed = items.map((item) => {
            const calc = (0, shared_1.calcSaleLine)({
                quantity: item.quantity,
                netWeightGram: (0, shared_1.moneyOrZero)(item.netWeight),
                ratePerGram: (0, shared_1.moneyNonZero)(item.goldRateSnapshot),
                unitPrice: (0, shared_1.moneyOrZero)(item.unitPrice),
                makingCharges: (0, shared_1.moneyOrZero)(item.makingCharges),
                stoneCharges: (0, shared_1.moneyOrZero)(item.stoneCharges),
                lineDiscount: (0, shared_1.moneyOrZero)(item.lineDiscount),
                vatRatePercent: (0, shared_1.moneyOrZero)(item.vatRate) === '0.000' ? '5.000' : (0, shared_1.moneyOrZero)(item.vatRate),
            });
            return {
                ...item,
                grossWeight: (0, shared_1.moneyOrZero)(item.grossWeight),
                netWeight: (0, shared_1.moneyOrZero)(item.netWeight),
                stoneWeight: (0, shared_1.moneyOrZero)(item.stoneWeight),
                goldRateSnapshot: (0, shared_1.moneyOrZero)(item.goldRateSnapshot),
                unitPrice: (0, shared_1.moneyOrZero)(item.unitPrice),
                makingCharges: (0, shared_1.moneyOrZero)(item.makingCharges),
                stoneCharges: (0, shared_1.moneyOrZero)(item.stoneCharges),
                lineDiscount: (0, shared_1.moneyOrZero)(item.lineDiscount),
                vatRate: (0, shared_1.moneyOrZero)(item.vatRate) === '0.000' ? '5.000' : (0, shared_1.moneyOrZero)(item.vatRate),
                lineNet: calc.lineNet,
                vatAmount: calc.vatAmount,
                lineTotal: calc.lineTotal,
            };
        });
        const subtotal = computed.reduce((s, i) => (0, shared_1.addMoney)(s, i.lineNet), '0.000');
        const vatBeforeDiscount = computed.reduce((s, i) => (0, shared_1.addMoney)(s, i.vatAmount), '0.000');
        const grossBeforeDiscount = computed.reduce((s, i) => (0, shared_1.addMoney)(s, i.lineTotal), '0.000');
        const discount = (0, shared_1.roundMoney)(headerDiscount);
        const taxable = (0, shared_1.roundMoney)((0, shared_1.subMoney)(subtotal, discount));
        const vatAmount = parseFloat(subtotal) > 0
            ? (0, shared_1.roundMoney)(((parseFloat(vatBeforeDiscount) * parseFloat(taxable)) /
                parseFloat(subtotal)).toFixed(3))
            : '0.000';
        const total = (0, shared_1.addMoney)(taxable, vatAmount);
        return {
            items: computed,
            subtotal: (0, shared_1.roundMoney)(subtotal),
            taxable,
            vatAmount,
            total,
            grossBeforeDiscount,
        };
    }
    async postSaleJournal(tx, ctx) {
        const lines = [];
        let cashTotal = '0.000';
        let bankTotal = '0.000';
        for (const p of ctx.payments) {
            if (p.method === client_1.PaymentMethod.CASH) {
                cashTotal = (0, shared_1.addMoney)(cashTotal, p.amount);
            }
            else if (p.method !== client_1.PaymentMethod.MIXED) {
                bankTotal = (0, shared_1.addMoney)(bankTotal, p.amount);
            }
        }
        if (parseFloat(cashTotal) > 0) {
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.CASH,
                debit: cashTotal,
                credit: '0.000',
            });
        }
        if (parseFloat(bankTotal) > 0) {
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.BANK,
                debit: bankTotal,
                credit: '0.000',
            });
        }
        if (parseFloat(ctx.balance) > 0 && ctx.customerId) {
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.AR,
                debit: ctx.balance,
                credit: '0.000',
                partyType: 'CUSTOMER',
                partyId: ctx.customerId,
            });
        }
        lines.push({
            accountCode: accounting_constants_1.ACCOUNT_CODES.SALES,
            debit: '0.000',
            credit: ctx.taxable,
        });
        if (parseFloat(ctx.vatAmount) > 0) {
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.OUTPUT_VAT,
                debit: '0.000',
                credit: ctx.vatAmount,
            });
        }
        if (parseFloat(ctx.cogsTotal) > 0) {
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.COGS,
                debit: ctx.cogsTotal,
                credit: '0.000',
            });
            lines.push({
                accountCode: accounting_constants_1.ACCOUNT_CODES.INVENTORY,
                debit: '0.000',
                credit: ctx.cogsTotal,
            });
        }
        await this.accounting.postJournal(tx, {
            entryDate: ctx.entryDate,
            memo: `Sale invoice ${ctx.invoiceNumber}`,
            sourceType: 'SALE_INVOICE',
            sourceId: ctx.invoiceId,
            createdById: ctx.userId,
            lines,
        });
    }
    async recordCashMovement(tx, amount, refType, refId, userId) {
        const openSession = await tx.cashSession.findFirst({
            where: { status: 'OPEN' },
            orderBy: { openedAt: 'desc' },
        });
        await tx.cashTransaction.create({
            data: {
                cashSessionId: openSession?.id ?? null,
                type: parseFloat(amount) >= 0 ? 'IN' : 'OUT',
                amount: (0, shared_1.roundMoney)(Math.abs(parseFloat(amount)).toFixed(3)),
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
        if (invoice.installment && typeof invoice.installment === 'object') {
            base.installment = (0, serialize_1.serializeRecord)(invoice.installment);
            const schedules = invoice.installment.schedules;
            if (Array.isArray(schedules)) {
                base.installment.schedules =
                    (0, serialize_1.serializeMany)(schedules);
            }
        }
        const total = parseFloat(String(base.total ?? 0));
        const paid = parseFloat(String(base.paid ?? 0));
        const balance = parseFloat(String(base.balance ?? 0));
        let paymentStatus = 'N/A';
        if (String(base.status) === client_1.DocumentStatus.POSTED) {
            if (balance <= 0.001 || paid + 0.001 >= total)
                paymentStatus = 'PAID';
            else if (paid > 0.001)
                paymentStatus = 'PARTIAL';
            else
                paymentStatus = 'UNPAID';
        }
        base.paymentStatus = paymentStatus;
        return base;
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        number_series_service_1.NumberSeriesService,
        inventory_service_1.InventoryService,
        accounting_service_1.AccountingService])
], SalesService);
//# sourceMappingURL=sales.service.js.map