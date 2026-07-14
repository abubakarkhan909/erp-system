import { NotFoundException } from '@nestjs/common';
import { PartyType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../../modules/number-series/number-series.service';

export type JournalLineInput = {
  accountCode: string;
  debit?: string | number | Prisma.Decimal;
  credit?: string | number | Prisma.Decimal;
  partyType?: PartyType;
  partyId?: string;
  narration?: string;
};

export async function postJournalEntry(
  prisma: PrismaService,
  numberSeries: NumberSeriesService,
  params: {
    entryDate: Date;
    memo: string;
    sourceType: string;
    sourceId: string;
    lines: JournalLineInput[];
    userId?: string;
  },
  tx?: Prisma.TransactionClient,
): Promise<{ id: string; number: string }> {
  const db = tx ?? prisma;

  const accountCodes = [...new Set(params.lines.map((l) => l.accountCode))];
  const accounts = await db.account.findMany({
    where: { code: { in: accountCodes }, isActive: true },
  });
  const accountMap = new Map(accounts.map((a) => [a.code, a.id]));

  for (const code of accountCodes) {
    if (!accountMap.has(code)) {
      throw new NotFoundException(`GL account ${code} not found`);
    }
  }

  const number = await numberSeries.nextNumber('JOURNAL', 'JE', tx);

  const entry = await db.journalEntry.create({
    data: {
      number,
      entryDate: params.entryDate,
      memo: params.memo,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      createdById: params.userId,
      lines: {
        create: params.lines.map((line) => ({
          accountId: accountMap.get(line.accountCode)!,
          debit: line.debit ?? 0,
          credit: line.credit ?? 0,
          partyType: line.partyType ?? null,
          partyId: line.partyId ?? null,
          narration: line.narration ?? null,
        })),
      },
    },
    select: { id: true, number: true },
  });

  return entry;
}
