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
export declare function postJournalEntry(prisma: PrismaService, numberSeries: NumberSeriesService, params: {
    entryDate: Date;
    memo: string;
    sourceType: string;
    sourceId: string;
    lines: JournalLineInput[];
    userId?: string;
}, tx?: Prisma.TransactionClient): Promise<{
    id: string;
    number: string;
}>;
