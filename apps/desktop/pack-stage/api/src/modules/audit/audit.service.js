"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(input) {
        return this.prisma.auditLog.create({
            data: {
                actorId: input.actorId ?? null,
                action: input.action,
                entity: input.entity,
                entityId: input.entityId ?? null,
                oldValues: input.oldValues ?? undefined,
                newValues: input.newValues ?? undefined,
                ip: input.ip ?? null,
            },
        });
    }
    async list(query) {
        const { page, pageSize, skip, take, search, sortBy, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = {
            ...(query.entity ? { entity: query.entity } : {}),
            ...(query.entityId ? { entityId: query.entityId } : {}),
            ...(query.actorId ? { actorId: query.actorId } : {}),
            ...(search
                ? {
                    OR: [
                        { action: { contains: search } },
                        { entity: { contains: search } },
                        { entityId: { contains: search } },
                    ],
                }
                : {}),
        };
        const sortOrder = sortDir;
        const orderBy = sortBy === 'action'
            ? { action: sortOrder }
            : sortBy === 'entity'
                ? { entity: sortOrder }
                : { createdAt: sortOrder };
        const [rows, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    actor: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                        },
                    },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows, total, page, pageSize);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map