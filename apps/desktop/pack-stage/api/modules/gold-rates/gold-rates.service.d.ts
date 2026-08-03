import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class GoldRatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            ratePerGram: Prisma.Decimal;
            rateDate: Date;
            karat: import("@prisma/client").$Enums.GoldKarat;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: Prisma.Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
    findByDate(dateStr: string): Promise<{
        rateDate: string;
        rates: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            ratePerGram: Prisma.Decimal;
            rateDate: Date;
            karat: import("@prisma/client").$Enums.GoldKarat;
        }[];
    }>;
    findLatest(): Promise<{
        rateDate: null;
        rates: never[];
    } | {
        rateDate: string;
        rates: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            ratePerGram: Prisma.Decimal;
            rateDate: Date;
            karat: import("@prisma/client").$Enums.GoldKarat;
        }[];
    }>;
    upsert(body: unknown, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: Prisma.Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
    create(body: unknown, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: Prisma.Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
    update(id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: Prisma.Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: Prisma.Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
}
