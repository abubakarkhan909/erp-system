import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CashSessionStatus } from '@prisma/client';
import { addMoney, moneySchema, roundMoney, subMoney } from '@jewelry-erp/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr } from '../../common/utils/pagination';
import { serializeMany, serializeRecord } from '../../common/utils/serialize';
import { zodValidate } from '../../common/utils/zod-validate';
import { z } from 'zod';

const openSessionSchema = z.object({
  sessionDate: z.string().or(z.coerce.date()).optional(),
  openingCash: moneySchema,
  notes: z.string().max(500).optional().nullable(),
});

const cashMovementSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  amount: moneySchema,
  reason: z.string().max(200).optional().nullable(),
  refType: z.string().max(50).optional().nullable(),
  refId: z.string().max(100).optional().nullable(),
});

const closeSessionSchema = z.object({
  closingCash: moneySchema,
  notes: z.string().max(500).optional().nullable(),
});

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async getOpenSession() {
    const session = await this.prisma.cashSession.findFirst({
      where: { status: CashSessionStatus.OPEN },
      orderBy: { openedAt: 'desc' },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    if (!session) return null;
    return {
      ...serializeRecord(session),
      transactions: serializeMany(session.transactions),
    };
  }

  async openSession(body: unknown, userId: string) {
    const dto = zodValidate(openSessionSchema, body);

    const existing = await this.prisma.cashSession.findFirst({
      where: { status: CashSessionStatus.OPEN },
    });
    if (existing) {
      throw new BadRequestException('A cash session is already open');
    }

    const session = await this.prisma.cashSession.create({
      data: {
        sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : new Date(),
        openingCash: roundMoney(dto.openingCash),
        status: CashSessionStatus.OPEN,
        openedById: userId,
        notes: dto.notes ?? null,
      },
    });

    return serializeRecord(session);
  }

  async cashIn(body: unknown, userId: string) {
    return this.recordMovement({ ...zodValidate(cashMovementSchema, body), type: 'IN' }, userId);
  }

  async cashOut(body: unknown, userId: string) {
    return this.recordMovement({ ...zodValidate(cashMovementSchema, body), type: 'OUT' }, userId);
  }

  private async recordMovement(
    dto: z.infer<typeof cashMovementSchema>,
    userId: string,
  ) {
    const session = await this.prisma.cashSession.findFirst({
      where: { status: CashSessionStatus.OPEN },
      orderBy: { openedAt: 'desc' },
    });
    if (!session) {
      throw new BadRequestException('No open cash session');
    }

    const amount = roundMoney(dto.amount);
    if (parseFloat(amount) <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const tx = await this.prisma.cashTransaction.create({
      data: {
        cashSessionId: session.id,
        type: dto.type,
        amount,
        reason: dto.reason ?? null,
        refType: dto.refType ?? null,
        refId: dto.refId ?? null,
        createdById: userId,
      },
    });

    return serializeRecord(tx);
  }

  async closeSession(body: unknown, userId: string) {
    const dto = zodValidate(closeSessionSchema, body);

    const session = await this.prisma.cashSession.findFirst({
      where: { status: CashSessionStatus.OPEN },
      include: { transactions: true },
      orderBy: { openedAt: 'desc' },
    });
    if (!session) {
      throw new NotFoundException('No open cash session');
    }

    let expected = decimalStr(session.openingCash);
    for (const t of session.transactions) {
      const amt = decimalStr(t.amount);
      expected =
        t.type === 'IN' ? addMoney(expected, amt) : subMoney(expected, amt);
    }

    const closingCash = roundMoney(dto.closingCash);
    const difference = subMoney(closingCash, expected);

    const updated = await this.prisma.cashSession.update({
      where: { id: session.id },
      data: {
        status: CashSessionStatus.CLOSED,
        closingCash,
        expectedCash: expected,
        difference,
        closedById: userId,
        closedAt: new Date(),
        notes: dto.notes ?? session.notes,
      },
    });

    return serializeRecord(updated);
  }

  async listSessions() {
    const sessions = await this.prisma.cashSession.findMany({
      orderBy: { openedAt: 'desc' },
      take: 30,
    });
    return serializeMany(sessions);
  }
}
