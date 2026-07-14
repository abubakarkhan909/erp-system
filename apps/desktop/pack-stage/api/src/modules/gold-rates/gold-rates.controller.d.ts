import { GoldRatesService } from './gold-rates.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class GoldRatesController {
    private readonly goldRatesService;
    constructor(goldRatesService: GoldRatesService);
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
            ratePerGram: import("@prisma/client/runtime/library").Decimal;
            rateDate: Date;
            karat: import("@prisma/client").$Enums.GoldKarat;
        }[];
    }>;
    findByDate(date: string): Promise<{
        rateDate: string;
        rates: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            ratePerGram: import("@prisma/client/runtime/library").Decimal;
            rateDate: Date;
            karat: import("@prisma/client").$Enums.GoldKarat;
        }[];
    }>;
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            ratePerGram: import("@prisma/client/runtime/library").Decimal;
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
        ratePerGram: import("@prisma/client/runtime/library").Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
    create(body: unknown, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: import("@prisma/client/runtime/library").Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
    update(id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: import("@prisma/client/runtime/library").Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        ratePerGram: import("@prisma/client/runtime/library").Decimal;
        rateDate: Date;
        karat: import("@prisma/client").$Enums.GoldKarat;
    }>;
}
