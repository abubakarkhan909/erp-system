import { CashService } from './cash.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class CashController {
    private readonly cashService;
    constructor(cashService: CashService);
    listSessions(): Promise<{
        id: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.CashSessionStatus;
        closedAt: Date | null;
        closedById: string | null;
        sessionDate: Date;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        difference: import("@prisma/client/runtime/library").Decimal | null;
        openedById: string;
        openedAt: Date;
    }[]>;
    getOpenSession(): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: string;
            refType: string | null;
            refId: string | null;
            reason: string | null;
            cashSessionId: string | null;
        }[];
        id: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.CashSessionStatus;
        closedAt: Date | null;
        closedById: string | null;
        sessionDate: Date;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        difference: import("@prisma/client/runtime/library").Decimal | null;
        openedById: string;
        openedAt: Date;
    } | null>;
    openSession(body: unknown, user: AuthUser): Promise<{
        id: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.CashSessionStatus;
        closedAt: Date | null;
        closedById: string | null;
        sessionDate: Date;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        difference: import("@prisma/client/runtime/library").Decimal | null;
        openedById: string;
        openedAt: Date;
    }>;
    closeSession(body: unknown, user: AuthUser): Promise<{
        id: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.CashSessionStatus;
        closedAt: Date | null;
        closedById: string | null;
        sessionDate: Date;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        difference: import("@prisma/client/runtime/library").Decimal | null;
        openedById: string;
        openedAt: Date;
    }>;
    cashIn(body: unknown, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        createdById: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        refType: string | null;
        refId: string | null;
        reason: string | null;
        cashSessionId: string | null;
    }>;
    cashOut(body: unknown, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        createdById: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        refType: string | null;
        refId: string | null;
        reason: string | null;
        cashSessionId: string | null;
    }>;
}
