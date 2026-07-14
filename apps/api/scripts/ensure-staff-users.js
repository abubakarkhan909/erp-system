const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

const STAFF = [
  { username: 'manager', fullName: 'Fatima Al Balushi', password: 'Manager@123', role: 'MANAGER' },
  { username: 'cashier', fullName: 'Ahmed Al Lawati', password: 'Cashier@123', role: 'CASHIER' },
  { username: 'salesman', fullName: 'Sara Al Hinai', password: 'Salesman@123', role: 'SALESMAN' },
  { username: 'accountant', fullName: 'Yousuf Al Zaabi', password: 'Accountant@123', role: 'ACCOUNTANT' },
];

async function main() {
  const existing = await p.user.findMany({
    where: { deletedAt: null },
    select: {
      username: true,
      fullName: true,
      isActive: true,
      roles: { select: { role: { select: { code: true } } } },
    },
  });
  console.log('BEFORE', JSON.stringify(existing, null, 2));

  for (const s of STAFF) {
    const role = await p.role.findUnique({ where: { code: s.role } });
    if (!role) {
      console.log('Missing role', s.role);
      continue;
    }
    const hash = await bcrypt.hash(s.password, 10);
    const user = await p.user.upsert({
      where: { username: s.username },
      update: {
        fullName: s.fullName,
        isActive: true,
        deletedAt: null,
        passwordHash: hash,
        passwordHint: s.password,
      },
      create: {
        username: s.username,
        fullName: s.fullName,
        email: `${s.username}@jewelry.local`,
        passwordHash: hash,
        passwordHint: s.password,
        isActive: true,
      },
    });
    await p.userRole.deleteMany({ where: { userId: user.id } });
    await p.userRole.create({ data: { userId: user.id, roleId: role.id } });
    console.log('Upserted', s.username, s.role);
  }

  // Ensure owner has OWNER role
  const owner = await p.user.findUnique({ where: { username: 'owner' } });
  const ownerRole = await p.role.findUnique({ where: { code: 'OWNER' } });
  if (owner && ownerRole) {
    await p.userRole.deleteMany({ where: { userId: owner.id } });
    await p.userRole.create({ data: { userId: owner.id, roleId: ownerRole.id } });
    await p.user.update({
      where: { id: owner.id },
      data: { passwordHint: 'Owner@12345' },
    });
  }

  const after = await p.user.findMany({
    where: { deletedAt: null },
    select: {
      username: true,
      roles: { select: { role: { select: { code: true } } } },
    },
  });
  console.log('AFTER', JSON.stringify(after, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
