import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR') ?? './data/uploads';
  }

  private ensureDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File | undefined, userId?: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }

    this.ensureDir();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedName = `${Date.now()}-${safeName}`;
    const storagePath = path.join(this.uploadDir, storedName);

    fs.writeFileSync(storagePath, file.buffer);

    const row = await this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        storagePath,
        mimeType: file.mimetype || null,
        sizeBytes: file.size,
        createdById: userId,
      },
    });

    return {
      id: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.attachment.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Attachment not found');
    return {
      id: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt.toISOString(),
      createdById: row.createdById,
    };
  }

  async getFileStream(id: string) {
    const row = await this.prisma.attachment.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Attachment not found');
    if (!fs.existsSync(row.storagePath)) {
      throw new NotFoundException('Attachment file missing on disk');
    }

    const stream = createReadStream(row.storagePath);
    return new StreamableFile(stream, {
      type: row.mimeType ?? 'application/octet-stream',
      disposition: `inline; filename="${row.fileName}"`,
    });
  }
}
