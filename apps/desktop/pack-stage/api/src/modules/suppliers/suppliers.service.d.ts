import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            email: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            updatedById: string | null;
            name: string;
            address: string | null;
            phone: string | null;
            openingBalance: Prisma.Decimal;
            currentBalance: Prisma.Decimal;
            notes: string | null;
            tradeLicense: string | null;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
        notes: string | null;
        tradeLicense: string | null;
    }>;
    create(body: unknown, userId?: string): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
        notes: string | null;
        tradeLicense: string | null;
    }>;
    update(id: string, body: unknown, userId?: string): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
        notes: string | null;
        tradeLicense: string | null;
    }>;
    remove(id: string, userId?: string): Promise<{
        id: string;
        email: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
        name: string;
        address: string | null;
        phone: string | null;
        openingBalance: Prisma.Decimal;
        currentBalance: Prisma.Decimal;
        notes: string | null;
        tradeLicense: string | null;
    }>;
    getLedger(id: string): Promise<{
        supplierId: string;
        currentBalance: string;
        openingBalance: string;
        purchases: {
            count: number;
            total: string;
            paid: string;
            balance: string;
        };
        payments: {
            count: number;
            total: string;
        };
        recentPurchases: {
            total: string;
            paid: string;
            balance: string;
            number: string;
            id: string;
            status: import("@prisma/client").$Enums.DocumentStatus;
            invoiceDate: Date;
        }[];
    }>;
}
