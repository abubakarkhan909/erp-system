const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

/**
 * Ensure default admin accounts always exist with known passwords.
 * Run: node scripts/ensure-admin-users.js
 */
const USERS = [
  { username: 'admin', password: 'admin@1234', fullName: 'Administrator', email: 'admin@jewelry.local' },
  { username: 'zahid', password: 'zahid@1234', fullName: 'Zahid', email: 'zahid@jewelry.local' },
];

async function main() {
  const prisma = new PrismaClient();
  const ownerRole = await prisma.role.findUnique({ where: { code: 'OWNER' } });
  if (!ownerRole) throw new Error('OWNER role missing — run prisma seed first');

  for (const u of USERS) {
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
    const link = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: ownerRole.id },
    });
    if (!link) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: ownerRole.id } });
    }
    console.log(`OK ${u.username} / ${u.password}`);
  }

  await prisma.user.updateMany({
    where: { username: 'owner' },
    data: { isActive: false },
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
