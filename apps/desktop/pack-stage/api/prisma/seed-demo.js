"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoData = seedDemoData;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const shared_1 = require("@jewelry-erp/shared");
const prisma = new client_1.PrismaClient();
function daysAgo(n) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d;
}
function daysFromNow(n) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
}
async function clearDemoData() {
    await prisma.journalLine.deleteMany({
        where: { journalEntry: { number: { startsWith: 'DEMO-JE-' } } },
    });
    await prisma.journalEntry.deleteMany({ where: { number: { startsWith: 'DEMO-JE-' } } });
    await prisma.installmentSchedule.deleteMany({
        where: { installmentPlan: { saleInvoice: { number: { startsWith: 'DEMO-' } } } },
    });
    await prisma.installmentPlan.deleteMany({
        where: { saleInvoice: { number: { startsWith: 'DEMO-' } } },
    });
    await prisma.salePayment.deleteMany({ where: { saleInvoice: { number: { startsWith: 'DEMO-' } } } });
    await prisma.saleInvoiceItem.deleteMany({ where: { saleInvoice: { number: { startsWith: 'DEMO-' } } } });
    await prisma.saleReturnItem.deleteMany({ where: { saleReturn: { number: { startsWith: 'DEMO-' } } } });
    await prisma.saleReturn.deleteMany({ where: { number: { startsWith: 'DEMO-' } } });
    await prisma.oldGoldExchange.deleteMany({ where: { number: { startsWith: 'DEMO-' } } });
    await prisma.saleInvoice.deleteMany({ where: { number: { startsWith: 'DEMO-' } } });
    await prisma.purchasePayment.deleteMany({
        where: { purchaseInvoice: { number: { startsWith: 'DEMO-' } } },
    });
    await prisma.purchaseInvoiceItem.deleteMany({
        where: { purchaseInvoice: { number: { startsWith: 'DEMO-' } } },
    });
    await prisma.purchaseReturnItem.deleteMany({
        where: { purchaseReturn: { number: { startsWith: 'DEMO-' } } },
    });
    await prisma.purchaseReturn.deleteMany({ where: { number: { startsWith: 'DEMO-' } } });
    await prisma.purchaseInvoice.deleteMany({ where: { number: { startsWith: 'DEMO-' } } });
    await prisma.advanceOrder.deleteMany({ where: { orderNo: { startsWith: 'DEMO-' } } });
    await prisma.customOrder.deleteMany({ where: { orderNo: { startsWith: 'DEMO-' } } });
    await prisma.repairOrder.deleteMany({ where: { orderNo: { startsWith: 'DEMO-' } } });
    await prisma.expense.deleteMany({ where: { number: { startsWith: 'DEMO-' } } });
    await prisma.utilityBill.deleteMany({ where: { notes: { contains: '[DEMO]' } } });
    await prisma.cashTransaction.deleteMany({ where: { reason: { contains: '[DEMO]' } } });
    await prisma.cashSession.deleteMany({ where: { notes: { contains: '[DEMO]' } } });
    await prisma.bankTransaction.deleteMany({ where: { memo: { contains: '[DEMO]' } } });
    await prisma.notification.deleteMany({ where: { title: { contains: '[DEMO]' } } });
    await prisma.auditLog.deleteMany({ where: { entity: { startsWith: 'DEMO_' } } });
    await prisma.backupJob.deleteMany({ where: { filePath: { contains: 'demo' } } });
    await prisma.vatReturn.deleteMany({ where: { year: 2026, month: 6 } });
    await prisma.stockMovement.deleteMany({ where: { notes: { contains: '[DEMO]' } } });
    await prisma.stockBalance.deleteMany({
        where: { product: { sku: { startsWith: 'DEMO-' } } },
    });
    await prisma.product.deleteMany({ where: { sku: { startsWith: 'DEMO-' } } });
    await prisma.customer.deleteMany({ where: { notes: { contains: '[DEMO]' } } });
    await prisma.supplier.deleteMany({ where: { notes: { contains: '[DEMO]' } } });
    await prisma.bankAccount.deleteMany({ where: { name: { startsWith: '[DEMO]' } } });
    await prisma.category.deleteMany({ where: { name: { startsWith: '[DEMO]' } } });
    await prisma.brand.deleteMany({ where: { name: { startsWith: '[DEMO]' } } });
}
async function ensureUser(username, fullName, roleCode, password) {
    const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
    const hash = await bcrypt.hash(password, 10);
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        await prisma.userRole.deleteMany({ where: { userId: existing.id } });
        await prisma.userRole.create({ data: { userId: existing.id, roleId: role.id } });
        return existing;
    }
    return prisma.user.create({
        data: {
            username,
            fullName,
            email: `${username}@jewelry.local`,
            passwordHash: hash,
            roles: { create: [{ roleId: role.id }] },
        },
    });
}
async function postJournal(opts) {
    const accounts = await prisma.account.findMany();
    const byCode = Object.fromEntries(accounts.map((a) => [a.code, a.id]));
    return prisma.journalEntry.create({
        data: {
            number: opts.number,
            entryDate: opts.entryDate,
            memo: opts.memo,
            sourceType: opts.sourceType,
            sourceId: opts.sourceId,
            status: client_1.JournalStatus.POSTED,
            periodId: opts.periodId,
            createdById: opts.userId,
            lines: {
                create: opts.lines.map((l) => ({
                    accountId: byCode[l.code],
                    debit: l.debit,
                    credit: l.credit,
                    narration: l.narration,
                    partyType: l.partyType,
                    partyId: l.partyId,
                })),
            },
        },
    });
}
async function seedDemoData() {
    console.log('Seeding demo data for all modules...');
    const owner = await prisma.user.findFirst({ where: { username: 'owner' } });
    if (!owner)
        throw new Error('Run base seed first (owner user missing)');
    const existingDemo = await prisma.customer.findFirst({ where: { notes: { contains: '[DEMO]' } } });
    if (existingDemo) {
        console.log('Clearing previous demo data...');
        await clearDemoData();
    }
    const manager = await ensureUser('manager', 'Fatima Al Balushi', 'MANAGER', 'Manager@123');
    const cashier = await ensureUser('cashier', 'Ahmed Al Lawati', 'CASHIER', 'Cashier@123');
    const salesman = await ensureUser('salesman', 'Sara Al Hinai', 'SALESMAN', 'Salesman@123');
    const accountant = await ensureUser('accountant', 'Yousuf Al Zaabi', 'ACCOUNTANT', 'Accountant@123');
    const today = daysAgo(0);
    const yesterday = daysAgo(1);
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const period = await prisma.fiscalPeriod.upsert({
        where: { year_month: { year, month } },
        update: {},
        create: { year, month, status: 'OPEN' },
    });
    const rateDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const rateRows = [
        { date: rateDay(yesterday), karat: 'K18', rate: '22.400' },
        { date: rateDay(yesterday), karat: 'K21', rate: '26.100' },
        { date: rateDay(yesterday), karat: 'K22', rate: '27.300' },
        { date: rateDay(yesterday), karat: 'K24', rate: '29.800' },
        { date: rateDay(today), karat: 'K18', rate: '22.500' },
        { date: rateDay(today), karat: 'K21', rate: '26.250' },
        { date: rateDay(today), karat: 'K22', rate: '27.500' },
        { date: rateDay(today), karat: 'K24', rate: '30.000' },
    ];
    for (const r of rateRows) {
        await prisma.goldRate.upsert({
            where: { rateDate_karat: { rateDate: r.date, karat: r.karat } },
            update: { ratePerGram: r.rate },
            create: {
                rateDate: r.date,
                karat: r.karat,
                ratePerGram: r.rate,
                createdById: owner.id,
            },
        });
    }
    const catRings = await prisma.category.upsert({
        where: { name: '[DEMO] Rings' },
        update: {},
        create: { name: '[DEMO] Rings' },
    });
    const catNecklaces = await prisma.category.upsert({
        where: { name: '[DEMO] Necklaces' },
        update: {},
        create: { name: '[DEMO] Necklaces' },
    });
    const catBangles = await prisma.category.upsert({
        where: { name: '[DEMO] Bangles' },
        update: {},
        create: { name: '[DEMO] Bangles' },
    });
    const catEarrings = await prisma.category.upsert({
        where: { name: '[DEMO] Earrings' },
        update: {},
        create: { name: '[DEMO] Earrings' },
    });
    const brandHouse = await prisma.brand.upsert({
        where: { name: '[DEMO] Al Mas House' },
        update: {},
        create: { name: '[DEMO] Al Mas House' },
    });
    const brandImport = await prisma.brand.upsert({
        where: { name: '[DEMO] Dubai Gold' },
        update: {},
        create: { name: '[DEMO] Dubai Gold' },
    });
    const customers = await Promise.all([
        {
            name: 'Khalid Al Busaidi',
            phone: '+96891110001',
            civilId: '12345678',
            openingBalance: '0.000',
            currentBalance: '85.000',
            address: 'Qurum, Muscat',
        },
        {
            name: 'Maryam Al Riyami',
            phone: '+96891110002',
            civilId: '23456789',
            openingBalance: '0.000',
            currentBalance: '0.000',
            address: 'Al Khuwair, Muscat',
        },
        {
            name: 'Hassan Al Mandhari',
            phone: '+96891110003',
            civilId: '34567890',
            openingBalance: '25.000',
            currentBalance: '25.000',
            address: 'Sohar',
        },
        {
            name: 'Aisha Al Habsi',
            phone: '+96891110004',
            civilId: '45678901',
            openingBalance: '0.000',
            currentBalance: '210.500',
            address: 'Nizwa',
        },
        {
            name: 'Walk-in Customer',
            phone: '+96891110005',
            civilId: null,
            openingBalance: '0.000',
            currentBalance: '0.000',
            address: 'Muscat',
        },
    ].map((c) => prisma.customer.create({
        data: {
            ...c,
            email: `${c.phone.replace('+', '')}@demo.om`,
            notes: '[DEMO] Sample customer for testing ledgers & sales',
            createdById: owner.id,
        },
    })));
    const [custKhalid, custMaryam, custHassan, custAisha, custWalkin] = customers;
    const suppliers = await Promise.all([
        {
            name: 'Muscat Gold Wholesale',
            phone: '+96824001111',
            tradeLicense: 'TL-1001',
            openingBalance: '0.000',
            currentBalance: '150.000',
        },
        {
            name: 'Dubai Bullion LLC',
            phone: '+97145002222',
            tradeLicense: 'TL-2002',
            openingBalance: '0.000',
            currentBalance: '0.000',
        },
        {
            name: 'Sohar Refinery Supply',
            phone: '+96826803333',
            tradeLicense: 'TL-3003',
            openingBalance: '50.000',
            currentBalance: '50.000',
        },
    ].map((s) => prisma.supplier.create({
        data: {
            ...s,
            address: 'Industrial Area',
            notes: '[DEMO] Sample supplier for purchases & payables',
            createdById: owner.id,
        },
    })));
    const [supMuscat, supDubai, supSohar] = suppliers;
    const productDefs = [
        {
            sku: 'DEMO-RNG-22-001',
            barcode: '8901000000011',
            name: '22K Floral Ring',
            categoryId: catRings.id,
            brandId: brandHouse.id,
            karat: 'K22',
            gross: '8.500',
            net: '8.200',
            stone: '0.300',
            making: '12.000',
            purchase: '200.000',
            selling: '250.000',
            qty: '12',
            weight: '98.400',
        },
        {
            sku: 'DEMO-NCK-21-002',
            barcode: '8901000000028',
            name: '21K Chain Necklace',
            categoryId: catNecklaces.id,
            brandId: brandImport.id,
            karat: 'K21',
            gross: '25.000',
            net: '24.500',
            stone: '0.500',
            making: '35.000',
            purchase: '550.000',
            selling: '680.000',
            qty: '5',
            weight: '122.500',
        },
        {
            sku: 'DEMO-BNG-22-003',
            barcode: '8901000000035',
            name: '22K Bangle Set',
            categoryId: catBangles.id,
            brandId: brandHouse.id,
            karat: 'K22',
            gross: '40.000',
            net: '39.200',
            stone: '0.800',
            making: '45.000',
            purchase: '900.000',
            selling: '1100.000',
            qty: '3',
            weight: '117.600',
        },
        {
            sku: 'DEMO-EAR-18-004',
            barcode: '8901000000042',
            name: '18K Pearl Earrings',
            categoryId: catEarrings.id,
            brandId: brandImport.id,
            karat: 'K18',
            gross: '6.000',
            net: '5.200',
            stone: '0.800',
            making: '18.000',
            purchase: '140.000',
            selling: '190.000',
            qty: '20',
            weight: '104.000',
        },
        {
            sku: 'DEMO-RNG-24-005',
            barcode: '8901000000059',
            name: '24K Plain Band',
            categoryId: catRings.id,
            brandId: brandHouse.id,
            karat: 'K24',
            gross: '10.000',
            net: '10.000',
            stone: '0.000',
            making: '5.000',
            purchase: '280.000',
            selling: '320.000',
            qty: '2',
            weight: '20.000',
        },
        {
            sku: 'DEMO-SCRAP-22',
            barcode: '8901000000066',
            name: '22K Scrap / Old Gold',
            categoryId: catRings.id,
            brandId: brandHouse.id,
            karat: 'K22',
            gross: '0.000',
            net: '0.000',
            stone: '0.000',
            making: '0.000',
            purchase: '0.000',
            selling: '0.000',
            qty: '0',
            weight: '15.500',
        },
    ];
    const products = [];
    for (const p of productDefs) {
        const product = await prisma.product.create({
            data: {
                sku: p.sku,
                barcode: p.barcode,
                name: p.name,
                description: '[DEMO] Sample jewelry product',
                categoryId: p.categoryId,
                brandId: p.brandId,
                productType: p.sku.includes('SCRAP') ? client_1.ProductType.RAW_GOLD : client_1.ProductType.FINISHED,
                stockMode: client_1.StockMode.BOTH,
                purityKarat: p.karat,
                grossWeight: p.gross,
                netWeight: p.net,
                stoneWeight: p.stone,
                makingCharges: p.making,
                stoneCharges: '0.000',
                vatRate: '5.000',
                purchasePrice: p.purchase,
                sellingPrice: p.selling,
                minStockQty: '2',
                minStockWeight: '10.000',
                status: 'ACTIVE',
                createdById: owner.id,
                stockBalance: {
                    create: {
                        onHandQty: p.qty,
                        onHandWeight: p.weight,
                        reservedQty: p.sku === 'DEMO-NCK-21-002' ? '1' : '0',
                        reservedWeight: p.sku === 'DEMO-NCK-21-002' ? '24.500' : '0.000',
                    },
                },
            },
        });
        products.push(product);
        await prisma.stockMovement.create({
            data: {
                productId: product.id,
                type: client_1.StockMovementType.PURCHASE,
                qty: p.qty,
                weight: p.weight,
                refType: 'DEMO_OPENING',
                refId: 'opening',
                notes: '[DEMO] Opening stock',
                createdById: owner.id,
            },
        });
    }
    const [ring22, necklace21, bangle22, earrings18, band24, scrap22] = products;
    const bankNbo = await prisma.bankAccount.create({
        data: {
            name: '[DEMO] NBO Current',
            bankName: 'National Bank of Oman',
            accountNo: '100200300',
            iban: 'OM12NBOB000000100200300',
            openingBalance: '5000.000',
            currentBalance: '5320.000',
            isActive: true,
        },
    });
    const bankMuscat = await prisma.bankAccount.create({
        data: {
            name: '[DEMO] Bank Muscat Savings',
            bankName: 'Bank Muscat',
            accountNo: '99887766',
            iban: 'OM45BMUS00000099887766',
            openingBalance: '2000.000',
            currentBalance: '1850.000',
            isActive: true,
        },
    });
    await prisma.bankTransaction.createMany({
        data: [
            {
                bankAccountId: bankNbo.id,
                type: client_1.BankTxnType.DEPOSIT,
                amount: '500.000',
                reference: 'DEMO-DEP-001',
                memo: '[DEMO] Customer card settlement',
                txnDate: yesterday,
                createdById: cashier.id,
            },
            {
                bankAccountId: bankMuscat.id,
                type: client_1.BankTxnType.WITHDRAW,
                amount: '150.000',
                reference: 'DEMO-WD-001',
                memo: '[DEMO] Cash for till',
                txnDate: yesterday,
                createdById: manager.id,
            },
            {
                bankAccountId: bankNbo.id,
                type: client_1.BankTxnType.TRANSFER,
                amount: '200.000',
                contraAccountId: bankMuscat.id,
                reference: 'DEMO-TR-001',
                memo: '[DEMO] Internal transfer',
                txnDate: today,
                createdById: accountant.id,
            },
        ],
    });
    const cashSession = await prisma.cashSession.create({
        data: {
            sessionDate: today,
            openingCash: '200.000',
            status: client_1.CashSessionStatus.OPEN,
            openedById: cashier.id,
            notes: '[DEMO] Today open till',
            transactions: {
                create: [
                    {
                        type: 'IN',
                        amount: '321.300',
                        reason: '[DEMO] Cash sale DEMO-INV-0001',
                        createdById: cashier.id,
                    },
                    {
                        type: 'OUT',
                        amount: '15.000',
                        reason: '[DEMO] Tea / petty cash',
                        createdById: cashier.id,
                    },
                ],
            },
        },
    });
    const purchLine = (0, shared_1.calcGoldLine)({
        netWeightGram: '50.000',
        ratePerGram: '25.000',
        makingCharges: '0.000',
        stoneCharges: '0.000',
        lineDiscount: '0.000',
        vatRatePercent: 5,
    });
    const purchNet = '1250.000';
    const purchVat = (0, shared_1.calcVat)(purchNet, 5);
    const purchase = await prisma.purchaseInvoice.create({
        data: {
            number: 'DEMO-PUR-0001',
            supplierId: supMuscat.id,
            invoiceDate: daysAgo(3),
            status: client_1.DocumentStatus.POSTED,
            subtotal: purchNet,
            discount: '0.000',
            taxable: purchVat.net,
            vatAmount: purchVat.vat,
            total: purchVat.gross,
            paid: '1162.500',
            balance: '150.000',
            notes: '[DEMO] Opening gold lot purchase',
            postedAt: daysAgo(3),
            createdById: manager.id,
            items: {
                create: [
                    {
                        productId: ring22.id,
                        quantity: '10',
                        grossWeight: '52.000',
                        netWeight: '50.000',
                        karat: 'K22',
                        unitCost: '25.000',
                        lineDiscount: '0.000',
                        lineNet: purchVat.net,
                        vatRate: '5.000',
                        vatAmount: purchVat.vat,
                        lineTotal: purchVat.gross,
                    },
                ],
            },
            payments: {
                create: [
                    {
                        method: client_1.PaymentMethod.BANK_TRANSFER,
                        amount: '1162.500',
                        bankAccountId: bankNbo.id,
                        reference: 'DEMO-PAY-SUP-001',
                        createdById: accountant.id,
                    },
                ],
            },
        },
    });
    await postJournal({
        number: 'DEMO-JE-PUR-0001',
        entryDate: daysAgo(3),
        memo: 'Demo purchase DEMO-PUR-0001',
        sourceType: 'PURCHASE',
        sourceId: purchase.id,
        userId: accountant.id,
        periodId: period.id,
        lines: [
            { code: '1300', debit: purchVat.net, credit: '0.000', narration: 'Inventory' },
            { code: '1400', debit: purchVat.vat, credit: '0.000', narration: 'Input VAT' },
            { code: '1100', debit: '0.000', credit: '1162.500', narration: 'Bank paid' },
            {
                code: '2000',
                debit: '0.000',
                credit: '150.000',
                narration: 'AP remaining',
                partyType: 'SUPPLIER',
                partyId: supMuscat.id,
            },
        ],
    });
    await prisma.purchaseInvoice.create({
        data: {
            number: 'DEMO-PUR-0002',
            supplierId: supDubai.id,
            invoiceDate: today,
            status: client_1.DocumentStatus.DRAFT,
            subtotal: '500.000',
            taxable: '500.000',
            vatAmount: '25.000',
            total: '525.000',
            paid: '0.000',
            balance: '525.000',
            notes: '[DEMO] Draft purchase — post from Purchases screen',
            createdById: manager.id,
            items: {
                create: [
                    {
                        productId: necklace21.id,
                        quantity: '2',
                        netWeight: '49.000',
                        karat: 'K21',
                        unitCost: '10.204',
                        lineNet: '500.000',
                        vatRate: '5.000',
                        vatAmount: '25.000',
                        lineTotal: '525.000',
                    },
                ],
            },
        },
    });
    const sale1Line = (0, shared_1.calcGoldLine)({
        netWeightGram: '8.200',
        ratePerGram: '27.500',
        makingCharges: '12.000',
        stoneCharges: '0.000',
        lineDiscount: '0.000',
        vatRatePercent: 5,
    });
    const sale1 = await prisma.saleInvoice.create({
        data: {
            number: 'DEMO-INV-0001',
            customerId: custMaryam.id,
            invoiceDate: today,
            status: client_1.DocumentStatus.POSTED,
            subtotal: sale1Line.lineNet,
            discount: '0.000',
            taxable: sale1Line.lineNet,
            vatAmount: sale1Line.vatAmount,
            total: sale1Line.lineTotal,
            paid: sale1Line.lineTotal,
            balance: '0.000',
            notes: '[DEMO] Full cash sale — see Payments + Cash + VAT',
            postedAt: today,
            createdById: cashier.id,
            items: {
                create: [
                    {
                        productId: ring22.id,
                        quantity: '1',
                        grossWeight: '8.500',
                        netWeight: '8.200',
                        stoneWeight: '0.300',
                        karat: 'K22',
                        goldRateSnapshot: '27.500',
                        makingCharges: '12.000',
                        stoneCharges: '0.000',
                        lineDiscount: '0.000',
                        lineNet: sale1Line.lineNet,
                        vatRate: '5.000',
                        vatAmount: sale1Line.vatAmount,
                        lineTotal: sale1Line.lineTotal,
                    },
                ],
            },
            payments: {
                create: [
                    {
                        method: client_1.PaymentMethod.CASH,
                        amount: sale1Line.lineTotal,
                        reference: 'DEMO-CASH-001',
                        createdById: cashier.id,
                    },
                ],
            },
        },
    });
    await prisma.stockBalance.update({
        where: { productId: ring22.id },
        data: {
            onHandQty: { decrement: 1 },
            onHandWeight: { decrement: 8.2 },
        },
    });
    await prisma.stockMovement.create({
        data: {
            productId: ring22.id,
            type: client_1.StockMovementType.SALE,
            qty: '-1',
            weight: '-8.200',
            refType: 'SALE',
            refId: sale1.id,
            notes: '[DEMO] Sold on DEMO-INV-0001',
            createdById: cashier.id,
        },
    });
    await postJournal({
        number: 'DEMO-JE-SAL-0001',
        entryDate: today,
        memo: 'Demo cash sale DEMO-INV-0001',
        sourceType: 'SALE',
        sourceId: sale1.id,
        userId: cashier.id,
        periodId: period.id,
        lines: [
            { code: '1000', debit: sale1Line.lineTotal, credit: '0.000' },
            { code: '4000', debit: '0.000', credit: sale1Line.lineNet },
            { code: '2100', debit: '0.000', credit: sale1Line.vatAmount },
            { code: '5000', debit: '200.000', credit: '0.000' },
            { code: '1300', debit: '0.000', credit: '200.000' },
        ],
    });
    const sale2Line = (0, shared_1.calcGoldLine)({
        netWeightGram: '24.500',
        ratePerGram: '26.250',
        makingCharges: '35.000',
        stoneCharges: '5.000',
        lineDiscount: '10.000',
        vatRatePercent: 5,
    });
    const sale2Paid = '600.000';
    const sale2Balance = (0, shared_1.subMoney)(sale2Line.lineTotal, sale2Paid);
    const sale2 = await prisma.saleInvoice.create({
        data: {
            number: 'DEMO-INV-0002',
            customerId: custKhalid.id,
            invoiceDate: yesterday,
            status: client_1.DocumentStatus.POSTED,
            subtotal: (0, shared_1.addMoney)(sale2Line.goldValue, '35.000', '5.000'),
            discount: '10.000',
            taxable: sale2Line.lineNet,
            vatAmount: sale2Line.vatAmount,
            total: sale2Line.lineTotal,
            paid: sale2Paid,
            balance: sale2Balance,
            notes: '[DEMO] Partial payment — remaining on customer ledger',
            postedAt: yesterday,
            createdById: salesman.id,
            items: {
                create: [
                    {
                        productId: necklace21.id,
                        quantity: '1',
                        grossWeight: '25.000',
                        netWeight: '24.500',
                        stoneWeight: '0.500',
                        karat: 'K21',
                        goldRateSnapshot: '26.250',
                        makingCharges: '35.000',
                        stoneCharges: '5.000',
                        lineDiscount: '10.000',
                        lineNet: sale2Line.lineNet,
                        vatRate: '5.000',
                        vatAmount: sale2Line.vatAmount,
                        lineTotal: sale2Line.lineTotal,
                    },
                ],
            },
            payments: {
                create: [
                    {
                        method: client_1.PaymentMethod.CARD,
                        amount: '400.000',
                        bankAccountId: bankNbo.id,
                        reference: 'OMANNET-9988',
                        createdById: cashier.id,
                    },
                    {
                        method: client_1.PaymentMethod.CASH,
                        amount: '200.000',
                        reference: 'DEMO-CASH-002',
                        createdById: cashier.id,
                    },
                ],
            },
        },
    });
    await postJournal({
        number: 'DEMO-JE-SAL-0002',
        entryDate: yesterday,
        memo: 'Demo credit/partial sale DEMO-INV-0002',
        sourceType: 'SALE',
        sourceId: sale2.id,
        userId: salesman.id,
        periodId: period.id,
        lines: [
            { code: '1100', debit: '400.000', credit: '0.000' },
            { code: '1000', debit: '200.000', credit: '0.000' },
            {
                code: '1200',
                debit: sale2Balance,
                credit: '0.000',
                partyType: 'CUSTOMER',
                partyId: custKhalid.id,
            },
            { code: '4000', debit: '0.000', credit: sale2Line.lineNet },
            { code: '2100', debit: '0.000', credit: sale2Line.vatAmount },
        ],
    });
    const sale3Total = '420.000';
    const sale3Vat = (0, shared_1.calcVat)('400.000', 5);
    const sale3 = await prisma.saleInvoice.create({
        data: {
            number: 'DEMO-INV-0003',
            customerId: custAisha.id,
            invoiceDate: daysAgo(10),
            status: client_1.DocumentStatus.POSTED,
            subtotal: '400.000',
            taxable: '400.000',
            vatAmount: '20.000',
            total: sale3Total,
            paid: '105.000',
            balance: '315.000',
            notes: '[DEMO] Sold on installment plan — open Installments module',
            postedAt: daysAgo(10),
            createdById: manager.id,
            items: {
                create: [
                    {
                        productId: earrings18.id,
                        quantity: '2',
                        netWeight: '10.400',
                        karat: 'K18',
                        goldRateSnapshot: '22.500',
                        makingCharges: '36.000',
                        lineNet: '400.000',
                        vatRate: '5.000',
                        vatAmount: '20.000',
                        lineTotal: '420.000',
                    },
                ],
            },
            payments: {
                create: [
                    {
                        method: client_1.PaymentMethod.CASH,
                        amount: '105.000',
                        reference: 'ADVANCE-INST',
                        createdById: cashier.id,
                    },
                ],
            },
        },
    });
    const instPlan = await prisma.installmentPlan.create({
        data: {
            saleInvoiceId: sale3.id,
            totalAmount: sale3Total,
            advanceAmount: '105.000',
            remainingAmount: '315.000',
            installmentAmount: '105.000',
            installmentCount: 3,
            createdById: manager.id,
            schedules: {
                create: [
                    {
                        dueDate: daysAgo(5),
                        amount: '105.000',
                        paidAmount: '105.000',
                        status: client_1.InstallmentStatus.PAID,
                        paidAt: daysAgo(4),
                    },
                    {
                        dueDate: daysFromNow(5),
                        amount: '105.000',
                        paidAmount: '0.000',
                        status: client_1.InstallmentStatus.PENDING,
                    },
                    {
                        dueDate: daysFromNow(35),
                        amount: '105.000',
                        paidAmount: '0.000',
                        status: client_1.InstallmentStatus.PENDING,
                    },
                ],
            },
        },
    });
    void instPlan;
    void sale3Vat;
    await prisma.saleInvoice.create({
        data: {
            number: 'DEMO-INV-0004',
            customerId: custWalkin.id,
            invoiceDate: today,
            status: client_1.DocumentStatus.DRAFT,
            subtotal: '100.000',
            taxable: '100.000',
            vatAmount: '5.000',
            total: '105.000',
            paid: '0.000',
            balance: '105.000',
            notes: '[DEMO] Draft invoice — edit & post from Sales',
            createdById: salesman.id,
            items: {
                create: [
                    {
                        productId: band24.id,
                        quantity: '1',
                        netWeight: '10.000',
                        karat: 'K24',
                        goldRateSnapshot: '30.000',
                        makingCharges: '5.000',
                        lineNet: '100.000',
                        vatRate: '5.000',
                        vatAmount: '5.000',
                        lineTotal: '105.000',
                    },
                ],
            },
        },
    });
    const saleReturn = await prisma.saleReturn.create({
        data: {
            number: 'DEMO-SR-0001',
            saleInvoiceId: sale1.id,
            customerId: custMaryam.id,
            returnDate: today,
            status: client_1.DocumentStatus.POSTED,
            taxable: '50.000',
            vatAmount: '2.500',
            total: '52.500',
            refundAmount: '52.500',
            notes: '[DEMO] Partial return / refund example',
            postedAt: today,
            createdById: manager.id,
            items: {
                create: [
                    {
                        productId: ring22.id,
                        quantity: '0.5',
                        netWeight: '1.000',
                        lineNet: '50.000',
                        vatRate: '5.000',
                        vatAmount: '2.500',
                        lineTotal: '52.500',
                    },
                ],
            },
        },
    });
    await postJournal({
        number: 'DEMO-JE-SR-0001',
        entryDate: today,
        memo: 'Demo sale return DEMO-SR-0001',
        sourceType: 'SALE_RETURN',
        sourceId: saleReturn.id,
        userId: manager.id,
        periodId: period.id,
        lines: [
            { code: '4000', debit: '50.000', credit: '0.000' },
            { code: '2100', debit: '2.500', credit: '0.000' },
            { code: '1000', debit: '0.000', credit: '52.500' },
        ],
    });
    await prisma.purchaseReturn.create({
        data: {
            number: 'DEMO-PR-0001',
            purchaseInvoiceId: purchase.id,
            supplierId: supMuscat.id,
            returnDate: today,
            status: client_1.DocumentStatus.DRAFT,
            taxable: '100.000',
            vatAmount: '5.000',
            total: '105.000',
            refundAmount: '0.000',
            notes: '[DEMO] Draft purchase return',
            createdById: manager.id,
            items: {
                create: [
                    {
                        productId: ring22.id,
                        quantity: '1',
                        netWeight: '4.000',
                        lineNet: '100.000',
                        vatRate: '5.000',
                        vatAmount: '5.000',
                        lineTotal: '105.000',
                    },
                ],
            },
        },
    });
    await prisma.oldGoldExchange.create({
        data: {
            number: 'DEMO-EX-0001',
            customerId: custHassan.id,
            saleInvoiceId: sale2.id,
            exchangeDate: yesterday,
            karat: 'K22',
            weight: '12.000',
            ratePerGram: '26.000',
            value: '312.000',
            paymentOut: '0.000',
            status: client_1.DocumentStatus.POSTED,
            notes: '[DEMO] Old gold exchanged against sale DEMO-INV-0002',
            postedAt: yesterday,
            createdById: cashier.id,
        },
    });
    await prisma.stockBalance.update({
        where: { productId: scrap22.id },
        data: { onHandWeight: { increment: 12 } },
    });
    await prisma.stockMovement.create({
        data: {
            productId: scrap22.id,
            type: client_1.StockMovementType.EXCHANGE_IN,
            qty: '0',
            weight: '12.000',
            refType: 'EXCHANGE',
            refId: 'DEMO-EX-0001',
            notes: '[DEMO] Old gold intake',
            createdById: cashier.id,
        },
    });
    await prisma.advanceOrder.create({
        data: {
            orderNo: 'DEMO-ADV-0001',
            customerId: custMaryam.id,
            description: '[DEMO] Custom 22K set — advance order',
            expectedDelivery: daysFromNow(14),
            totalAmount: '800.000',
            advancePaid: '200.000',
            remaining: '600.000',
            status: client_1.AdvanceOrderStatus.PENDING,
            notes: '[DEMO] Track status Pending → Ready → Delivered',
            createdById: salesman.id,
        },
    });
    await prisma.advanceOrder.create({
        data: {
            orderNo: 'DEMO-ADV-0002',
            customerId: custKhalid.id,
            description: '[DEMO] Ready for pickup — bridal set',
            expectedDelivery: daysFromNow(2),
            totalAmount: '1500.000',
            advancePaid: '1500.000',
            remaining: '0.000',
            status: client_1.AdvanceOrderStatus.READY,
            notes: '[DEMO] Fully paid advance, ready status',
            createdById: manager.id,
        },
    });
    await prisma.customOrder.create({
        data: {
            orderNo: 'DEMO-CO-0001',
            customerId: custAisha.id,
            specs: '[DEMO] Custom name pendant, Arabic calligraphy, 21K',
            karat: 'K21',
            estimatedWeight: '15.000',
            estimatedAmount: '450.000',
            advancePaid: '100.000',
            expectedDelivery: daysFromNow(20),
            status: client_1.AdvanceOrderStatus.PENDING,
            createdById: salesman.id,
        },
    });
    await prisma.repairOrder.create({
        data: {
            orderNo: 'DEMO-RP-0001',
            customerId: custHassan.id,
            description: '[DEMO] Resize ring + polish',
            estimatedAmount: '15.000',
            advancePaid: '5.000',
            expectedDelivery: daysFromNow(3),
            status: client_1.AdvanceOrderStatus.PENDING,
            createdById: cashier.id,
        },
    });
    const expCat = await prisma.expenseCategory.findMany();
    const catByCode = Object.fromEntries(expCat.map((c) => [c.code, c.id]));
    await prisma.expense.createMany({
        data: [
            {
                number: 'DEMO-EXP-0001',
                expenseDate: daysAgo(2),
                categoryId: catByCode.ELECTRIC,
                amount: '45.500',
                paymentMethod: client_1.PaymentMethod.BANK_TRANSFER,
                bankAccountId: bankNbo.id,
                reference: 'ELEC-JUL',
                notes: '[DEMO] Shop electricity',
                createdById: accountant.id,
            },
            {
                number: 'DEMO-EXP-0002',
                expenseDate: daysAgo(1),
                categoryId: catByCode.SALARY,
                amount: '350.000',
                paymentMethod: client_1.PaymentMethod.BANK_TRANSFER,
                bankAccountId: bankNbo.id,
                reference: 'SAL-JUL',
                notes: '[DEMO] Staff salary advance',
                createdById: accountant.id,
            },
            {
                number: 'DEMO-EXP-0003',
                expenseDate: today,
                categoryId: catByCode.TEA,
                amount: '3.250',
                paymentMethod: client_1.PaymentMethod.CASH,
                reference: 'PETTY',
                notes: '[DEMO] Tea / hospitality',
                createdById: cashier.id,
            },
            {
                number: 'DEMO-EXP-0004',
                expenseDate: today,
                categoryId: catByCode.MARKETING,
                amount: '25.000',
                paymentMethod: client_1.PaymentMethod.CARD,
                bankAccountId: bankMuscat.id,
                reference: 'ADS',
                notes: '[DEMO] Instagram ads',
                createdById: manager.id,
            },
        ],
    });
    await postJournal({
        number: 'DEMO-JE-EXP-0001',
        entryDate: daysAgo(2),
        memo: 'Demo expense electricity',
        sourceType: 'EXPENSE',
        sourceId: 'DEMO-EXP-0001',
        userId: accountant.id,
        periodId: period.id,
        lines: [
            { code: '5100', debit: '45.500', credit: '0.000' },
            { code: '1100', debit: '0.000', credit: '45.500' },
        ],
    });
    await prisma.utilityBill.createMany({
        data: [
            {
                type: client_1.UtilityBillType.ELECTRIC,
                billNumber: 'DEMO-ELEC-7788',
                dueDate: daysFromNow(7),
                amount: '48.000',
                status: client_1.UtilityBillStatus.PENDING,
                notes: '[DEMO] Upcoming electric bill',
            },
            {
                type: client_1.UtilityBillType.WATER,
                billNumber: 'DEMO-WATER-112',
                dueDate: daysAgo(2),
                amount: '12.500',
                status: client_1.UtilityBillStatus.OVERDUE,
                notes: '[DEMO] Overdue water bill',
            },
            {
                type: client_1.UtilityBillType.INTERNET,
                billNumber: 'DEMO-NET-55',
                dueDate: daysAgo(1),
                paidDate: today,
                amount: '20.000',
                status: client_1.UtilityBillStatus.PAID,
                notes: '[DEMO] Paid internet',
            },
            {
                type: client_1.UtilityBillType.RENT,
                billNumber: 'DEMO-RENT-JUL',
                dueDate: daysFromNow(3),
                amount: '400.000',
                status: client_1.UtilityBillStatus.PENDING,
                notes: '[DEMO] Shop rent due soon',
            },
        ],
    });
    await prisma.vatReturn.upsert({
        where: { year_month: { year: 2026, month: 6 } },
        update: {},
        create: {
            year: 2026,
            month: 6,
            outputVat: '120.500',
            inputVat: '80.250',
            netVat: '40.250',
            taxableSales: '2410.000',
            taxablePurchases: '1605.000',
            lockedAt: daysAgo(20),
        },
    });
    await prisma.notification.createMany({
        data: [
            {
                userId: owner.id,
                type: 'LOW_STOCK',
                title: '[DEMO] Low stock: 24K Plain Band',
                body: 'Only 2 pcs left — below preferred display stock.',
                refType: 'PRODUCT',
                refId: band24.id,
            },
            {
                userId: owner.id,
                type: 'INSTALLMENT',
                title: '[DEMO] Upcoming installment',
                body: 'Aisha Al Habsi installment due in 5 days (105.000 OMR).',
                refType: 'INSTALLMENT',
                refId: sale3.id,
            },
            {
                userId: accountant.id,
                type: 'UTILITY',
                title: '[DEMO] Overdue water bill',
                body: 'Water bill DEMO-WATER-112 is overdue (12.500 OMR).',
                refType: 'UTILITY_BILL',
            },
            {
                userId: owner.id,
                type: 'BACKUP',
                title: '[DEMO] Backup reminder',
                body: 'Create a manual backup from Backup module this week.',
                refType: 'BACKUP',
            },
            {
                userId: manager.id,
                type: 'PAYMENT',
                title: '[DEMO] Pending supplier payment',
                body: 'Muscat Gold Wholesale balance 150.000 OMR.',
                refType: 'SUPPLIER',
                refId: supMuscat.id,
            },
        ],
    });
    await prisma.auditLog.createMany({
        data: [
            {
                actorId: owner.id,
                action: 'SEED',
                entity: 'DEMO_SYSTEM',
                entityId: 'seed',
                newValues: { message: 'Demo dataset loaded' },
            },
            {
                actorId: cashier.id,
                action: 'CREATE',
                entity: 'DEMO_SALE',
                entityId: sale1.id,
                newValues: { number: 'DEMO-INV-0001', total: sale1Line.lineTotal },
            },
            {
                actorId: manager.id,
                action: 'POST',
                entity: 'DEMO_PURCHASE',
                entityId: purchase.id,
                newValues: { number: 'DEMO-PUR-0001' },
            },
        ],
    });
    await prisma.backupJob.create({
        data: {
            type: 'MANUAL',
            status: 'COMPLETED',
            filePath: './data/backups/demo-backup-sample.json',
            sizeBytes: 20480,
            createdById: owner.id,
        },
    });
    const y = year;
    for (const row of [
        { docType: 'SALE', prefix: 'INV', nextValue: 5 },
        { docType: 'PURCHASE', prefix: 'PUR', nextValue: 3 },
        { docType: 'SALE_RETURN', prefix: 'SR', nextValue: 2 },
        { docType: 'JOURNAL', prefix: 'JE', nextValue: 10 },
        { docType: 'EXPENSE', prefix: 'EXP', nextValue: 5 },
        { docType: 'ADVANCE_ORDER', prefix: 'ADV', nextValue: 3 },
    ]) {
        await prisma.numberSeries.upsert({
            where: { docType_year: { docType: row.docType, year: y } },
            update: { nextValue: row.nextValue, prefix: row.prefix },
            create: { ...row, year: y },
        });
    }
    await prisma.stockMovement.create({
        data: {
            productId: band24.id,
            type: client_1.StockMovementType.DAMAGE,
            qty: '-0.000',
            weight: '-0.500',
            notes: '[DEMO] Damaged sample piece weight write-off',
            createdById: manager.id,
        },
    });
    console.log('');
    console.log('========== DEMO LOGIN ACCOUNTS ==========');
    console.log('owner      / Owner@12345     (Owner)');
    console.log('manager    / Manager@123     (Manager)');
    console.log('cashier    / Cashier@123     (Cashier)');
    console.log('salesman   / Salesman@123    (Salesman)');
    console.log('accountant / Accountant@123  (Accountant)');
    console.log('');
    console.log('========== WHERE TO LOOK IN UI ==========');
    console.log('Dashboard     → today sales/expenses totals');
    console.log('Customers     → 5 demo customers (notes contain [DEMO])');
    console.log('Suppliers     → 3 demo suppliers');
    console.log('Products      → SKUs starting DEMO-');
    console.log('Gold Rates    → today + yesterday for 18/21/22/24K');
    console.log('Sales         → DEMO-INV-0001..0004 (posted/draft/installment)');
    console.log('Purchases     → DEMO-PUR-0001 posted, 0002 draft');
    console.log('Inventory     → stock balances + movements');
    console.log('Cash / Banks  → open till + NBO / Bank Muscat');
    console.log('Expenses      → DEMO-EXP-0001..0004');
    console.log('VAT           → posted output/input + June 2026 lock sample');
    console.log('Accounting    → DEMO-JE-* journals, COA, trial balance');
    console.log('Advances      → DEMO-ADV / custom / repair orders');
    console.log('Installments  → plan on DEMO-INV-0003');
    console.log('Notifications → low stock, bills, backup reminders');
    console.log('Audit / Backup→ sample rows');
    console.log('=========================================');
    console.log('Demo data seed complete.');
    void cashSession;
    void purchLine;
    void bangle22;
    void shared_1.roundMoney;
}
if (require.main === module) {
    seedDemoData()
        .catch((e) => {
        console.error(e);
        process.exit(1);
    })
        .finally(async () => {
        await prisma.$disconnect();
    });
}
//# sourceMappingURL=seed-demo.js.map