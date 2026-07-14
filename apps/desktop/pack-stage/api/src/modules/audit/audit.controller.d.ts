import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    list(page?: number, pageSize?: number, search?: string, sortBy?: string, sortDir?: 'asc' | 'desc', entity?: string, entityId?: string, actorId?: string): Promise<{
        data: ({
            actor: {
                id: string;
                username: string;
                fullName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            action: string;
            entity: string;
            entityId: string | null;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            ip: string | null;
            actorId: string | null;
        })[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
}
