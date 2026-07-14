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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const PERMISSIONS = [
    { code: 'customers.read', name: 'View customers' },
    { code: 'customers.write', name: 'Manage customers' },
    { code: 'suppliers.read', name: 'View suppliers' },
    { code: 'suppliers.write', name: 'Manage suppliers' },
    { code: 'products.read', name: 'View products' },
    { code: 'products.write', name: 'Manage products' },
    { code: 'sales.read', name: 'View sales' },
    { code: 'sales.write', name: 'Create/edit sales' },
    { code: 'sales.post', name: 'Post sales' },
    { code: 'sales.void', name: 'Void sales' },
    { code: 'purchases.read', name: 'View purchases' },
    { code: 'purchases.write', name: 'Manage purchases' },
    { code: 'purchases.post', name: 'Post purchases' },
    { code: 'purchases.void', name: 'Void purchases' },
    { code: 'inventory.read', name: 'View inventory' },
    { code: 'inventory.write', name: 'Adjust inventory' },
    { code: 'cash.read', name: 'View cash' },
    { code: 'cash.write', name: 'Manage cash' },
    { code: 'cash.close', name: 'Close cash session' },
    { code: 'bank.read', name: 'View banks' },
    { code: 'bank.write', name: 'Manage banks' },
    { code: 'expenses.read', name: 'View expenses' },
    { code: 'expenses.write', name: 'Manage expenses' },
    { code: 'vat.read', name: 'View VAT' },
    { code: 'vat.export', name: 'Export VAT' },
    { code: 'accounting.read', name: 'View accounting' },
    { code: 'accounting.write', name: 'Manage accounting' },
    { code: 'accounting.close_period', name: 'Close fiscal period' },
    { code: 'reports.read', name: 'View reports' },
    { code: 'settings.manage', name: 'Manage settings' },
    { code: 'users.manage', name: 'Manage users' },
    { code: 'backup.create', name: 'Create backups' },
    { code: 'backup.restore', name: 'Restore backups' },
    { code: 'audit.read', name: 'View audit logs' },
];
const ROLE_PERMS = {
    OWNER: 'ALL',
    MANAGER: [
        'customers.read', 'customers.write', 'suppliers.read', 'suppliers.write',
        'products.read', 'products.write', 'sales.read', 'sales.write', 'sales.post',
        'purchases.read', 'purchases.write', 'purchases.post', 'purchases.void', 'inventory.read', 'inventory.write',
        'cash.read', 'cash.write', 'cash.close', 'bank.read', 'bank.write',
        'expenses.read', 'expenses.write', 'vat.read', 'vat.export',
        'accounting.read', 'reports.read', 'backup.create', 'audit.read',
    ],
    CASHIER: [
        'customers.read', 'customers.write', 'products.read', 'sales.read', 'sales.write', 'sales.post',
        'cash.read', 'cash.write', 'inventory.read', 'reports.read',
    ],
    SALESMAN: [
        'customers.read', 'products.read', 'sales.read', 'sales.write', 'inventory.read',
    ],
    ACCOUNTANT: [
        'customers.read', 'suppliers.read', 'sales.read', 'purchases.read',
        'expenses.read', 'expenses.write', 'vat.read', 'vat.export',
        'accounting.read', 'accounting.write', 'accounting.close_period',
        'bank.read', 'bank.write', 'cash.read', 'reports.read', 'audit.read', 'backup.create',
    ],
};
const ACCOUNTS = [
    { code: '1000', name: 'Cash on Hand', type: 'ASSET', isCashBook: true },
    { code: '1100', name: 'Bank Accounts', type: 'ASSET', isBankBook: true },
    { code: '1200', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '1300', name: 'Inventory - Gold', type: 'ASSET' },
    { code: '1400', name: 'Input VAT Recoverable', type: 'ASSET' },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
    { code: '2100', name: 'Output VAT Payable', type: 'LIABILITY' },
    { code: '2200', name: 'Customer Advances', type: 'LIABILITY' },
    { code: '3000', name: 'Owner Capital', type: 'EQUITY' },
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE' },
    { code: '4100', name: 'Making Charges Revenue', type: 'REVENUE' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' },
    { code: '5100', name: 'Operating Expenses', type: 'EXPENSE' },
];
const EXPENSE_CATEGORIES = [
    { code: 'ELECTRIC', name: 'Electric Bill' },
    { code: 'WATER', name: 'Water Bill' },
    { code: 'GAS', name: 'Gas Bill' },
    { code: 'INTERNET', name: 'Internet Bill' },
    { code: 'PHONE', name: 'Phone Bill' },
    { code: 'SALARY', name: 'Salary' },
    { code: 'FUEL', name: 'Fuel' },
    { code: 'TEA', name: 'Tea' },
    { code: 'TRANSPORT', name: 'Transport' },
    { code: 'OFFICE', name: 'Office Expense' },
    { code: 'REPAIR', name: 'Repair' },
    { code: 'CLEANING', name: 'Cleaning' },
    { code: 'PACKAGING', name: 'Packaging' },
    { code: 'MARKETING', name: 'Marketing' },
    { code: 'GOV_TAX', name: 'Government Tax' },
    { code: 'MISC', name: 'Miscellaneous' },
];
async function main() {
    console.log('Seeding Jewelry ERP (Oman / OMR)...');
    for (const p of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { code: p.code },
            update: { name: p.name },
            create: p,
        });
    }
    const allPerms = await prisma.permission.findMany();
    const permByCode = Object.fromEntries(allPerms.map((p) => [p.code, p.id]));
    for (const code of Object.keys(ROLE_PERMS)) {
        const role = await prisma.role.upsert({
            where: { code },
            update: { name: code.charAt(0) + code.slice(1).toLowerCase() },
            create: {
                code,
                name: code.charAt(0) + code.slice(1).toLowerCase(),
                description: `${code} role`,
            },
        });
        await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
        const codes = ROLE_PERMS[code] === 'ALL' ? PERMISSIONS.map((p) => p.code) : ROLE_PERMS[code];
        for (const c of codes) {
            if (!permByCode[c])
                continue;
            await prisma.rolePermission.create({
                data: { roleId: role.id, permissionId: permByCode[c] },
            });
        }
    }
    const username = process.env.SEED_OWNER_USERNAME || 'owner';
    const password = process.env.SEED_OWNER_PASSWORD || 'Owner@12345';
    const hash = await bcrypt.hash(password, 10);
    const ownerRole = await prisma.role.findUniqueOrThrow({ where: { code: 'OWNER' } });
    const owner = await prisma.user.upsert({
        where: { username },
        update: {},
        create: {
            username,
            fullName: 'Shop Owner',
            email: 'owner@jewelry.local',
            passwordHash: hash,
            roles: { create: [{ roleId: ownerRole.id }] },
        },
    });
    await prisma.company.upsert({
        where: { id: (await prisma.company.findFirst())?.id || 'seed-company' },
        update: {},
        create: {
            id: 'seed-company',
            name: 'Al Mas Jewelry',
            address: 'Muttrah, Muscat, Sultanate of Oman',
            phone: '+968 2400 0000',
            email: 'info@almasjewelry.om',
            crNumber: 'CR-000000',
            vatNumber: 'OM1234567890',
            currency: 'OMR',
            defaultVatRate: 5,
            invoicePrefix: 'INV',
            receiptFooter: 'Thank you for shopping with us. VAT Inclusive where applicable.',
        },
    });
    for (const a of ACCOUNTS) {
        await prisma.account.upsert({
            where: { code: a.code },
            update: { name: a.name },
            create: {
                code: a.code,
                name: a.name,
                type: a.type,
                isSystem: true,
                isCashBook: a.isCashBook ?? false,
                isBankBook: a.isBankBook ?? false,
            },
        });
    }
    for (const c of EXPENSE_CATEGORIES) {
        await prisma.expenseCategory.upsert({
            where: { code: c.code },
            update: { name: c.name },
            create: c,
        });
    }
    const now = new Date();
    const rateDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const rates = [
        { karat: 'K18', rate: '22.500' },
        { karat: 'K21', rate: '26.250' },
        { karat: 'K22', rate: '27.500' },
        { karat: 'K24', rate: '30.000' },
    ];
    for (const r of rates) {
        const existing = await prisma.goldRate.findFirst({
            where: {
                karat: r.karat,
                rateDate: {
                    gte: rateDate,
                    lt: new Date(rateDate.getTime() + 24 * 60 * 60 * 1000),
                },
            },
        });
        if (existing) {
            await prisma.goldRate.update({
                where: { id: existing.id },
                data: { ratePerGram: r.rate },
            });
        }
        else {
            try {
                await prisma.goldRate.create({
                    data: {
                        rateDate,
                        karat: r.karat,
                        ratePerGram: r.rate,
                        createdById: owner.id,
                    },
                });
            }
            catch (err) {
                const code = err?.code;
                if (code !== 'P2002')
                    throw err;
            }
        }
    }
    await prisma.category.upsert({
        where: { name: 'Rings' },
        update: {},
        create: { name: 'Rings' },
    });
    await prisma.category.upsert({
        where: { name: 'Necklaces' },
        update: {},
        create: { name: 'Necklaces' },
    });
    await prisma.brand.upsert({
        where: { name: 'In-House' },
        update: {},
        create: { name: 'In-House' },
    });
    const year = rateDate.getUTCFullYear();
    const month = rateDate.getUTCMonth() + 1;
    await prisma.fiscalPeriod.upsert({
        where: { year_month: { year, month } },
        update: {},
        create: { year, month, status: 'OPEN' },
    });
    console.log(`Owner login: ${username} / ${password}`);
    console.log('Base seed complete.');
    if (process.env.SEED_DEMO === '1' || process.env.SEED_DEMO === 'true') {
        console.log('Loading demo data (SEED_DEMO=1)...');
        const { seedDemoData } = await Promise.resolve().then(() => __importStar(require('./seed-demo')));
        await seedDemoData();
        console.log('Demo seeding finished.');
    }
    else {
        console.log('Skipped demo data (set SEED_DEMO=1 to include).');
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map