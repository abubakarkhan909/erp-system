import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class NumberSeriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    nextNumber(docType: string, prefix: string, tx?: Prisma.TransactionClient): Promise<string>;
}
