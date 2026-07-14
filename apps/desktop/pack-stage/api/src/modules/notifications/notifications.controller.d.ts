import type { AuthUser } from '@jewelry-erp/shared';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(query: Record<string, unknown>, user: AuthUser): Promise<{
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
    markRead(id: string, user: AuthUser): Promise<{
        id: string;
        isRead: boolean;
    }>;
    scanAndCreate(): Promise<{
        scanned: boolean;
        createdCount: number;
        notificationIds: string[];
    }>;
}
