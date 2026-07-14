/**
 * Reset owner password to Owner@12345 (bcrypt).
 * Does NOT print connection secrets.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const USERNAME = process.env.RESET_USERNAME || 'owner';
const PASSWORD = process.env.RESET_PASSWORD || 'Owner@12345';

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      username: true,
      isActive: true,
      roles: { select: { role: { select: { code: true } } } },
    },
  });

  console.log(
    'Users in DB:',
    users.map((u) => ({
      username: u.username,
      isActive: u.isActive,
      roles: u.roles.map((r) => r.role.code),
    })),
  );

  const owner = await prisma.user.findFirst({
    where: { username: USERNAME, deletedAt: null },
  });

  if (!owner) {
    console.error(`User "${USERNAME}" not found. Run: pnpm db:seed`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: owner.id },
    data: {
      passwordHash: hash,
      passwordHint: PASSWORD,
      isActive: true,
    },
  });

  const ok = await bcrypt.compare(PASSWORD, hash);
  console.log(`Password reset for "${USERNAME}" ok=${ok}`);
  console.log(`Login with: ${USERNAME} / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('DB/reset failed:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
