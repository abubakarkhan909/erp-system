import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export interface AuditLogInput {
    actorId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    ip?: string | null;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(input: AuditLogInput): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        oldValues: Prisma.JsonValue | null;
        newValues: Prisma.JsonValue | null;
        ip: string | null;
        actorId: string | null;
    }>;
    list(query: {
        page?: number;
        pageSize?: number;
        search?: string;
        sortBy?: string;
        sortDir?: 'asc' | 'desc';
        entity?: string;
        entityId?: string;
        actorId?: string;
    }): Promise<{
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
            oldValues: Prisma.JsonValue | null;
            newValues: Prisma.JsonValue | null;
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
