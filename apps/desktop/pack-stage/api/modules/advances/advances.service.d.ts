import { PrismaService } from '../../prisma/prisma.service';
import { NumberSeriesService } from '../number-series/number-series.service';
export declare class AdvancesService {
    private readonly prisma;
    private readonly numberSeries;
    constructor(prisma: PrismaService, numberSeries: NumberSeriesService);
    private assertTransition;
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
    createAdvanceOrder(body: unknown, userId?: string): Promise<{
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
    updateAdvanceOrder(id: string, body: unknown, userId?: string): Promise<{
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
    transitionAdvanceOrderStatus(id: string, body: unknown, _userId?: string): Promise<{
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
    recordAdvancePayment(id: string, body: unknown, userId?: string): Promise<{
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
    removeAdvanceOrder(id: string, userId?: string): Promise<Record<string, unknown>>;
    private postAdvanceJournal;
    private formatAdvanceOrder;
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
    createCustomOrder(body: unknown, userId?: string): Promise<{
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
    updateCustomOrder(id: string, body: unknown, _userId?: string): Promise<{
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
    transitionCustomOrderStatus(id: string, body: unknown, _userId?: string): Promise<{
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
    private formatCustomOrder;
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
    createRepairOrder(body: unknown, userId?: string): Promise<{
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
    updateRepairOrder(id: string, body: unknown, _userId?: string): Promise<{
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
    transitionRepairOrderStatus(id: string, body: unknown, _userId?: string): Promise<{
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
    private formatRepairOrder;
}
