import { PrismaClient, RoleCode, AccountType, GoldKarat } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS: Array<{ code: string; name: string }> = [
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

const ROLE_PERMS: Record<RoleCode, string[] | 'ALL'> = {
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

const ACCOUNTS: Array<{ code: string; name: string; type: AccountType; isCashBook?: boolean; isBankBook?: boolean }> = [
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

  for (const code of Object.keys(ROLE_PERMS) as RoleCode[]) {
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
    const codes = ROLE_PERMS[code] === 'ALL' ? PERMISSIONS.map((p) => p.code) : (ROLE_PERMS[code] as string[]);
    for (const c of codes) {
      if (!permByCode[c]) continue;
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: permByCode[c] },
      });
    }
  }

  const ownerRole = await prisma.role.findUniqueOrThrow({ where: { code: 'OWNER' } });

  /** Fixed shop admin accounts (always ensured on every seed). */
  const ADMIN_USERS = [
    {
      username: 'admin',
      password: 'admin@1234',
      fullName: 'Administrator',
      email: 'admin@jewelry.local',
    },
    {
      username: 'zahid',
      password: 'zahid@1234',
      fullName: 'Zahid',
      email: 'zahid@jewelry.local',
    },
  ] as const;

  let primaryAdminId = '';
  for (const u of ADMIN_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        fullName: u.fullName,
        email: u.email,
        passwordHash: hash,
        passwordHint: u.password,
        isActive: true,
        deletedAt: null,
      },
      create: {
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        passwordHash: hash,
        passwordHint: u.password,
        roles: { create: [{ roleId: ownerRole.id }] },
      },
    });

    const hasOwnerRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: ownerRole.id },
    });
    if (!hasOwnerRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: ownerRole.id },
      });
    }

    if (u.username === 'admin') primaryAdminId = user.id;
    console.log(`Admin login: ${u.username} / ${u.password}`);
  }

  // Disable legacy seed user so it is not confused with the new admins
  await prisma.user.updateMany({
    where: { username: 'owner' },
    data: { isActive: false },
  });

  const owner = await prisma.user.findUniqueOrThrow({
    where: { id: primaryAdminId },
  });

  await prisma.company.upsert({
    where: { id: (await prisma.company.findFirst())?.id || 'seed-company' },
    update: {},
    create: {
      id: 'seed-company',
      name: 'Al Zahid Jewelry',
      address: 'Muttrah, Muscat, Sultanate of Oman',
      phone: '+968 2400 0000',
      email: 'info@alzahidjewelry.om',
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
  // Use UTC midnight so upsert matches date uniqueness across timezones
  const rateDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const rates: Array<{ karat: GoldKarat; rate: string }> = [
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
    } else {
      try {
        await prisma.goldRate.create({
          data: {
            rateDate,
            karat: r.karat,
            ratePerGram: r.rate,
            createdById: owner.id,
          },
        });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code !== 'P2002') throw err;
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

  console.log('Base seed complete.');
  console.log('Login with: admin / admin@1234  or  zahid / zahid@1234');

  // Demo data is optional — never block client first-run installers
  if (process.env.SEED_DEMO === '1' || process.env.SEED_DEMO === 'true') {
    console.log('Loading demo data (SEED_DEMO=1)...');
    const { seedDemoData } = await import('./seed-demo');
    await seedDemoData();
    console.log('Demo seeding finished.');
  } else {
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
