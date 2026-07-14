import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  FiscalPeriodStatus,
  JournalStatus,
  Prisma,
} from '@prisma/client';
import { addMoney, roundMoney, subMoney } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
import { decimalStr } from '../../common/utils/pagination';
import { ACCOUNT_CODES } from './accounting.constants';

export type JournalLineInput = {
  accountCode: string;
  debit: string;
  credit: string;
  partyType?: 'CUSTOMER' | 'SUPPLIER';
  partyId?: string;
  narration?: string;
};

export type PostJournalInput = {
  entryDate: Date | string;
  memo?: string;
  sourceType?: string;
  sourceId?: string;
  lines: JournalLineInput[];
  createdById?: string;
};

@Injectable()
export class AccountingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberSeries: NumberSeriesService,
  ) {}

  async resolveAccountByCode(code: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    const account = await db.account.findUnique({ where: { code } });
    if (!account) {
      throw new NotFoundException(`Account ${code} not found`);
    }
    return account;
  }

  async ensurePeriodOpen(date: Date | string, tx?: Prisma.TransactionClient) {
    const entryDate = this.toDate(date);
    const year = entryDate.getFullYear();
    const month = entryDate.getMonth() + 1;
    const db = tx ?? this.prisma;

    let period = await db.fiscalPeriod.findUnique({
      where: { year_month: { year, month } },
    });

    if (!period) {
      period = await db.fiscalPeriod.create({
        data: { year, month, status: FiscalPeriodStatus.OPEN },
      });
    }

    if (period.status === FiscalPeriodStatus.CLOSED) {
      throw new BadRequestException(
        `Fiscal period ${year}-${String(month).padStart(2, '0')} is closed`,
      );
    }

    return period;
  }

  async postJournal(tx: Prisma.TransactionClient, input: PostJournalInput) {
    const entryDate = this.toDate(input.entryDate);
    const period = await this.ensurePeriodOpen(entryDate, tx);

    let totalDebit = '0.000';
    let totalCredit = '0.000';
    for (const line of input.lines) {
      totalDebit = addMoney(totalDebit, line.debit ?? '0.000');
      totalCredit = addMoney(totalCredit, line.credit ?? '0.000');
    }

    if (roundMoney(totalDebit) !== roundMoney(totalCredit)) {
      throw new BadRequestException(
        `Journal not balanced: debit ${totalDebit} != credit ${totalCredit}`,
      );
    }

    if (input.lines.length === 0) {
      throw new BadRequestException('Journal must have at least one line');
    }

    const number = await this.numberSeries.nextNumber('JRN', 'JRN', tx);

    const entry = await tx.journalEntry.create({
      data: {
        number,
        entryDate,
        memo: input.memo ?? null,
        sourceType: input.sourceType ?? null,
        sourceId: input.sourceId ?? null,
        periodId: period.id,
        createdById: input.createdById ?? null,
        lines: {
          create: await Promise.all(
            input.lines.map(async (line) => {
              const account = await this.resolveAccountByCode(line.accountCode, tx);
              return {
                accountId: account.id,
                debit: roundMoney(line.debit ?? '0.000'),
                credit: roundMoney(line.credit ?? '0.000'),
                partyType: line.partyType ?? null,
                partyId: line.partyId ?? null,
                narration: line.narration ?? null,
              };
            }),
          ),
        },
      },
      include: { lines: { include: { account: true } } },
    });

    return entry;
  }

  async reverseJournal(
    tx: Prisma.TransactionClient,
    journalEntryId: string,
    createdById?: string,
    memo?: string,
  ) {
    const original = await tx.journalEntry.findUnique({
      where: { id: journalEntryId },
      include: { lines: { include: { account: true } } },
    });

    if (!original) {
      throw new NotFoundException('Journal entry not found');
    }

    if (original.status === JournalStatus.REVERSED) {
      throw new BadRequestException('Journal already reversed');
    }

    const reversal = await this.postJournal(tx, {
      entryDate: original.entryDate,
      memo: memo ?? `Reversal of ${original.number}`,
      sourceType: 'JOURNAL_REVERSAL',
      sourceId: original.id,
      createdById,
      lines: original.lines.map((line) => ({
        accountCode: line.account.code,
        debit: decimalStr(line.credit),
        credit: decimalStr(line.debit),
        partyType: line.partyType ?? undefined,
        partyId: line.partyId ?? undefined,
        narration: line.narration ? `Reversal: ${line.narration}` : undefined,
      })),
    });

    await tx.journalEntry.update({
      where: { id: original.id },
      data: { status: JournalStatus.REVERSED },
    });

    return reversal;
  }

  async reverseJournalBySource(
    tx: Prisma.TransactionClient,
    sourceType: string,
    sourceId: string,
    createdById?: string,
  ) {
    const original = await tx.journalEntry.findFirst({
      where: { sourceType, sourceId, status: JournalStatus.POSTED },
      include: { lines: { include: { account: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (!original) {
      return null;
    }

    return this.reverseJournal(
      tx,
      original.id,
      createdById,
      `Reversal of ${sourceType} ${sourceId}`,
    );
  }

  async getChartOfAccounts() {
    const accounts = await this.prisma.account.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
    return accounts;
  }

  private async aggregateByAccount(
    from?: Date,
    to?: Date,
    accountTypes?: AccountType[],
  ) {
    const where: Prisma.JournalLineWhereInput = {
      journalEntry: {
        status: JournalStatus.POSTED,
        ...(from || to
          ? {
              entryDate: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      ...(accountTypes?.length
        ? { account: { type: { in: accountTypes } } }
        : {}),
    };

    const lines = await this.prisma.journalLine.findMany({
      where,
      include: { account: true },
    });

    const map = new Map<
      string,
      { code: string; name: string; type: AccountType; debit: string; credit: string }
    >();

    for (const line of lines) {
      const key = line.accountId;
      const existing = map.get(key) ?? {
        code: line.account.code,
        name: line.account.name,
        type: line.account.type,
        debit: '0.000',
        credit: '0.000',
      };
      existing.debit = addMoney(existing.debit, decimalStr(line.debit));
      existing.credit = addMoney(existing.credit, decimalStr(line.credit));
      map.set(key, existing);
    }

    return [...map.values()].map((row) => ({
      ...row,
      balance: subMoney(row.debit, row.credit),
    }));
  }

  async getTrialBalance(from?: string, to?: string) {
    const fromDate = from ? this.toDate(from) : undefined;
    const toDate = to ? this.toDate(to) : undefined;
    const rows = await this.aggregateByAccount(fromDate, toDate);
    const totalDebit = rows.reduce((s, r) => addMoney(s, r.debit), '0.000');
    const totalCredit = rows.reduce((s, r) => addMoney(s, r.credit), '0.000');
    return { rows, totalDebit, totalCredit };
  }

  async getProfitAndLoss(from?: string, to?: string) {
    const fromDate = from ? this.toDate(from) : undefined;
    const toDate = to ? this.toDate(to) : undefined;
    const rows = await this.aggregateByAccount(fromDate, toDate, [
      AccountType.REVENUE,
      AccountType.EXPENSE,
    ]);

    let revenue = '0.000';
    let expenses = '0.000';

    for (const row of rows) {
      const net = subMoney(row.credit, row.debit);
      if (row.type === AccountType.REVENUE) {
        revenue = addMoney(revenue, net);
      } else {
        expenses = addMoney(expenses, subMoney(row.debit, row.credit));
      }
    }

    return {
      rows,
      revenue: roundMoney(revenue),
      expenses: roundMoney(expenses),
      netProfit: roundMoney(subMoney(revenue, expenses)),
    };
  }

  async getBalanceSheet(asOf?: string) {
    const toDate = asOf ? this.toDate(asOf) : new Date();
    const rows = await this.aggregateByAccount(undefined, toDate, [
      AccountType.ASSET,
      AccountType.LIABILITY,
      AccountType.EQUITY,
    ]);

    let assets = '0.000';
    let liabilities = '0.000';
    let equity = '0.000';

    for (const row of rows) {
      const balance = subMoney(row.debit, row.credit);
      if (row.type === AccountType.ASSET) {
        assets = addMoney(assets, balance);
      } else if (row.type === AccountType.LIABILITY) {
        liabilities = addMoney(liabilities, subMoney(row.credit, row.debit));
      } else {
        equity = addMoney(equity, subMoney(row.credit, row.debit));
      }
    }

    return {
      asOf: toDate.toISOString().slice(0, 10),
      rows,
      assets: roundMoney(assets),
      liabilities: roundMoney(liabilities),
      equity: roundMoney(equity),
    };
  }

  async getCashFlow(from?: string, to?: string) {
    const fromDate = from ? this.toDate(from) : undefined;
    const toDate = to ? this.toDate(to) : undefined;
    const rows = await this.aggregateByAccount(fromDate, toDate, [AccountType.ASSET]);

    const cashCodes = [ACCOUNT_CODES.CASH, ACCOUNT_CODES.BANK];
    const cashRows = rows.filter((r) => cashCodes.includes(r.code as typeof ACCOUNT_CODES.CASH));
    const netCash = cashRows.reduce(
      (s, r) => addMoney(s, subMoney(r.debit, r.credit)),
      '0.000',
    );

    return {
      from: fromDate?.toISOString().slice(0, 10),
      to: toDate?.toISOString().slice(0, 10),
      cashAccounts: cashRows,
      netCashChange: roundMoney(netCash),
    };
  }

  async closePeriod(year: number, month: number, closedById?: string) {
    const period = await this.prisma.fiscalPeriod.findUnique({
      where: { year_month: { year, month } },
    });

    if (!period) {
      throw new NotFoundException('Fiscal period not found');
    }

    if (period.status === FiscalPeriodStatus.CLOSED) {
      throw new BadRequestException('Period already closed');
    }

    return this.prisma.fiscalPeriod.update({
      where: { id: period.id },
      data: {
        status: FiscalPeriodStatus.CLOSED,
        closedAt: new Date(),
        closedById: closedById ?? null,
      },
    });
  }

  async postManualJournal(body: PostJournalInput, userId?: string) {
    return this.prisma.$transaction((tx) =>
      this.postJournal(tx, { ...body, createdById: userId }),
    );
  }

  private toDate(value: Date | string): Date {
    if (value instanceof Date) {
      return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return d;
  }
}
