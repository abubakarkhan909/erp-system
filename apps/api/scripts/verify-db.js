const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const tables = await p.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`,
  );
  console.log('tables', tables.length);
  console.log(tables.map((t) => t.name).join(', '));
  const users = await p.user.count();
  const perms = await p.permission.count();
  const roles = await p.role.count();
  const accts = await p.account.count();
  const company = await p.company.findFirst();
  console.log({ users, perms, roles, accts, company: company?.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
