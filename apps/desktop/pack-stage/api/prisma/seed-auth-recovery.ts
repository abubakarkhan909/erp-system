/**
 * One-time: add password hints, security questions, owner recovery key for demo users.
 * Run: pnpm exec ts-node --transpile-only prisma/seed-auth-recovery.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ROUNDS = 10;

const DEMO_CREDENTIALS: Record<string, string> = {
  owner: 'Owner@12345',
  manager: 'Manager@123',
  cashier: 'Cashier@123',
  salesman: 'Salesman@123',
  accountant: 'Accountant@123',
};

const QUESTIONS = [
  { question: 'What is your favorite color?', answer: 'green' },
  { question: 'What is your favorite food?', answer: 'shawarma' },
  { question: 'What city were you born in?', answer: 'muscat' },
];

async function main() {
  console.log('Seeding auth recovery data...');

  for (const [username, password] of Object.entries(DEMO_CREDENTIALS)) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, ROUNDS),
        passwordHint: password,
      },
    });

    await prisma.userSecurityQuestion.deleteMany({ where: { userId: user.id } });
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i]!;
      await prisma.userSecurityQuestion.create({
        data: {
          userId: user.id,
          question: q.question,
          answerHash: await bcrypt.hash(q.answer.toLowerCase(), ROUNDS),
          sortOrder: i,
        },
      });
    }
    console.log(`  ${username} → vault + 3 security questions`);
  }

  const recoveryKey = 'AlMas-Recover-2026';
  await prisma.appSetting.upsert({
    where: { key: 'owner_recovery_key_hash' },
    update: { value: await bcrypt.hash(recoveryKey, ROUNDS) },
    create: {
      key: 'owner_recovery_key_hash',
      value: await bcrypt.hash(recoveryKey, ROUNDS),
    },
  });

  console.log('');
  console.log('========== LOGIN ACCOUNTS ==========');
  for (const [u, p] of Object.entries(DEMO_CREDENTIALS)) {
    console.log(`${u.padEnd(12)} / ${p}`);
  }
  console.log('');
  console.log('Owner recovery key:', recoveryKey);
  console.log('Sample security answers: green / shawarma / muscat');
  console.log('===================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
