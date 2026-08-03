import { SalesService } from './sales.service';
import type { AuthUser } from '@jewelry-erp/shared';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(query: Record<string, unknown>): Promise<{
        data: {
            paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "N/A";
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: unknown, user: AuthUser): Promise<Record<string, unknown>>;
    update(id: string, body: unknown, user: AuthUser): Promise<Record<string, unknown>>;
    remove(id: string, user: AuthUser): Promise<{
        deleted: boolean;
    }>;
    post(id: string, body: unknown, user: AuthUser): Promise<Record<string, unknown>>;
    void(id: string, user: AuthUser): Promise<Record<string, unknown>>;
}
