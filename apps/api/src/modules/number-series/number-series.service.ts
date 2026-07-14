import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NumberSeriesService {
  constructor(private readonly prisma: PrismaService) {}

  async nextNumber(
    docType: string,
    prefix: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const year = new Date().getFullYear();

    const run = async (db: Prisma.TransactionClient) => {
      const existing = await db.numberSeries.findUnique({
        where: { docType_year: { docType, year } },
      });

      if (existing) {
        const updated = await db.numberSeries.update({
          where: { id: existing.id },
          data: { nextValue: { increment: 1 } },
        });
        const number = updated.nextValue - 1;
        return `${updated.prefix}-${year}-${String(number).padStart(5, '0')}`;
      }

      const created = await db.numberSeries.create({
        data: {
          docType,
          prefix,
          year,
          nextValue: 2,
        },
      });

      return `${created.prefix}-${year}-${String(1).padStart(5, '0')}`;
    };

    if (tx) {
      return run(tx);
    }

    return this.prisma.$transaction((transaction: Prisma.TransactionClient) =>
      run(transaction),
    );
  }
}
