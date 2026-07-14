import { StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AttachmentsService {
    private readonly prisma;
    private readonly config;
    private readonly uploadDir;
    constructor(prisma: PrismaService, config: ConfigService);
    private ensureDir;
    upload(file: Express.Multer.File | undefined, userId?: string): Promise<{
        id: string;
        fileName: string;
        mimeType: string | null;
        sizeBytes: number | null;
        createdAt: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        fileName: string;
        mimeType: string | null;
        sizeBytes: number | null;
        createdAt: string;
        createdById: string | null;
    }>;
    getFileStream(id: string): Promise<StreamableFile>;
}
