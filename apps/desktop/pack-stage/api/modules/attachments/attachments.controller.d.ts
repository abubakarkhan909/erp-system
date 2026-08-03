import type { AuthUser } from '@jewelry-erp/shared';
import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    upload(file: Express.Multer.File, user: AuthUser): Promise<{
        id: string;
        fileName: string;
        mimeType: string | null;
        sizeBytes: number | null;
        createdAt: string;
    }>;
    download(id: string): Promise<import("@nestjs/common").StreamableFile>;
    findOne(id: string): Promise<{
        id: string;
        fileName: string;
        mimeType: string | null;
        sizeBytes: number | null;
        createdAt: string;
        createdById: string | null;
    }>;
}
