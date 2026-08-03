"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const prisma_service_1 = require("../../prisma/prisma.service");
let AttachmentsService = class AttachmentsService {
    prisma;
    config;
    uploadDir;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.uploadDir = this.config.get('UPLOAD_DIR') ?? './data/uploads';
    }
    ensureDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async upload(file, userId) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('File is required');
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
    async findOne(id) {
        const row = await this.prisma.attachment.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Attachment not found');
        return {
            id: row.id,
            fileName: row.fileName,
            mimeType: row.mimeType,
            sizeBytes: row.sizeBytes,
            createdAt: row.createdAt.toISOString(),
            createdById: row.createdById,
        };
    }
    async getFileStream(id) {
        const row = await this.prisma.attachment.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Attachment not found');
        if (!fs.existsSync(row.storagePath)) {
            throw new common_1.NotFoundException('Attachment file missing on disk');
        }
        const stream = (0, fs_1.createReadStream)(row.storagePath);
        return new common_1.StreamableFile(stream, {
            type: row.mimeType ?? 'application/octet-stream',
            disposition: `inline; filename="${row.fileName}"`,
        });
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map