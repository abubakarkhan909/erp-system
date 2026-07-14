import { PrismaService } from '../../prisma/prisma.service';
export type CreateNotificationInput = {
    userId?: string;
    type: string;
    title: string;
    body: string;
    refType?: string;
    refId?: string;
};
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createNotification(input: CreateNotificationInput): Promise<{
        id: string;
        type: string;
        title: string;
        body: string;
        isRead: boolean;
        refType: string | null;
        refId: string | null;
        createdAt: string;
    }>;
    list(query: Record<string, unknown>, userId?: string): Promise<{
        data: {
            id: string;
            userId: string | null;
            type: string;
            title: string;
            body: string;
            isRead: boolean;
            refType: string | null;
            refId: string | null;
            createdAt: string;
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    markRead(id: string, userId?: string): Promise<{
        id: string;
        isRead: boolean;
    }>;
    scanAndCreate(): Promise<{
        scanned: boolean;
        createdCount: number;
        notificationIds: string[];
    }>;
}
