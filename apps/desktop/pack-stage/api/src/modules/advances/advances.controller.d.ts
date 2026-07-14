import type { AuthUser } from '@jewelry-erp/shared';
import { AdvancesService } from './advances.service';
export declare class AdvancesController {
    private readonly advancesService;
    constructor(advancesService: AdvancesService);
    listAdvanceOrders(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            orderNo: string;
            customerId: string;
            customer: {
                id: string;
                name: string;
                phone?: string | null;
            } | undefined;
            description: string;
            expectedDelivery: string | null;
            totalAmount: string;
            advancePaid: string;
            remaining: string;
            status: import("@prisma/client").$Enums.AdvanceOrderStatus;
            notes: string | null;
            createdAt: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getAdvanceOrder(id: string): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
            phone?: string | null;
        } | undefined;
        description: string;
        expectedDelivery: string | null;
        totalAmount: string;
        advancePaid: string;
        remaining: string;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        notes: string | null;
        createdAt: string;
    }>;
    createAdvanceOrder(body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
            phone?: string | null;
        } | undefined;
        description: string;
        expectedDelivery: string | null;
        totalAmount: string;
        advancePaid: string;
        remaining: string;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        notes: string | null;
        createdAt: string;
    }>;
    updateAdvanceOrder(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
            phone?: string | null;
        } | undefined;
        description: string;
        expectedDelivery: string | null;
        totalAmount: string;
        advancePaid: string;
        remaining: string;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        notes: string | null;
        createdAt: string;
    }>;
    transitionAdvanceOrderStatus(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
            phone?: string | null;
        } | undefined;
        description: string;
        expectedDelivery: string | null;
        totalAmount: string;
        advancePaid: string;
        remaining: string;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        notes: string | null;
        createdAt: string;
    }>;
    recordAdvancePayment(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
            phone?: string | null;
        } | undefined;
        description: string;
        expectedDelivery: string | null;
        totalAmount: string;
        advancePaid: string;
        remaining: string;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        notes: string | null;
        createdAt: string;
    }>;
    removeAdvanceOrder(id: string, user: AuthUser): Promise<Record<string, unknown>>;
    listCustomOrders(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            orderNo: string;
            customerId: string;
            customer: {
                id: string;
                name: string;
            } | undefined;
            specs: string;
            karat: import("@prisma/client").$Enums.GoldKarat | null;
            estimatedWeight: string | null;
            estimatedAmount: string;
            advancePaid: string;
            expectedDelivery: string | null;
            status: import("@prisma/client").$Enums.AdvanceOrderStatus;
            createdAt: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getCustomOrder(id: string): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        specs: string;
        karat: import("@prisma/client").$Enums.GoldKarat | null;
        estimatedWeight: string | null;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
    createCustomOrder(body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        specs: string;
        karat: import("@prisma/client").$Enums.GoldKarat | null;
        estimatedWeight: string | null;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
    updateCustomOrder(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        specs: string;
        karat: import("@prisma/client").$Enums.GoldKarat | null;
        estimatedWeight: string | null;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
    transitionCustomOrderStatus(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        specs: string;
        karat: import("@prisma/client").$Enums.GoldKarat | null;
        estimatedWeight: string | null;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
    listRepairOrders(query: Record<string, unknown>): Promise<{
        data: {
            id: string;
            orderNo: string;
            customerId: string;
            customer: {
                id: string;
                name: string;
            } | undefined;
            description: string;
            estimatedAmount: string;
            advancePaid: string;
            expectedDelivery: string | null;
            status: import("@prisma/client").$Enums.AdvanceOrderStatus;
            createdAt: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    getRepairOrder(id: string): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        description: string;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
    createRepairOrder(body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        description: string;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
    updateRepairOrder(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        description: string;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
    transitionRepairOrderStatus(id: string, body: unknown, user: AuthUser): Promise<{
        id: string;
        orderNo: string;
        customerId: string;
        customer: {
            id: string;
            name: string;
        } | undefined;
        description: string;
        estimatedAmount: string;
        advancePaid: string;
        expectedDelivery: string | null;
        status: import("@prisma/client").$Enums.AdvanceOrderStatus;
        createdAt: string;
    }>;
}
