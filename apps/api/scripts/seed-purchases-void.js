const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const perm = await prisma.permission.upsert({
    where: { code: 'purchases.void' },
    update: { name: 'Void purchases' },
    create: { code: 'purchases.void', name: 'Void purchases' },
  });

  const roles = await prisma.role.findMany({
    where: { code: { in: ['OWNER', 'MANAGER'] } },
  });

  for (const role of roles) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: role.id, permissionId: perm.id },
    });
  }

  console.log(
    'seeded purchases.void for',
    roles.map((r) => r.code).join(','),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
