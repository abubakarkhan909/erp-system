const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const tables = await p.$queryRawUnsafe('SHOW TABLES');
  console.log('tables', tables.length);
  console.log(tables.map((t) => Object.values(t)[0]).join(', '));
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
