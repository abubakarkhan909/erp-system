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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const BCRYPT_ROUNDS = 10;
const userSelect = {
    id: true,
    username: true,
    email: true,
    fullName: true,
    passwordHint: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    roles: {
        select: {
            role: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
        },
    },
    securityQuestions: {
        select: {
            id: true,
            question: true,
            sortOrder: true,
        },
        orderBy: { sortOrder: 'asc' },
    },
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const { page, pageSize, skip, take, search, sortBy, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = {
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { username: { contains: search } },
                        { fullName: { contains: search } },
                        { email: { contains: search } },
                    ],
                }
                : {}),
        };
        const sortOrder = sortDir;
        const orderBy = sortBy === 'username'
            ? { username: sortOrder }
            : sortBy === 'fullName'
                ? { fullName: sortOrder }
                : { createdAt: sortOrder };
        const [rows, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take,
                orderBy,
                select: userSelect,
            }),
            this.prisma.user.count({ where }),
        ]);
        const data = rows.map((user) => this.mapUser(user));
        return (0, pagination_1.paginatedResult)(data, total, page, pageSize);
    }
    async listRoles() {
        const roles = await this.prisma.role.findMany({
            orderBy: { code: 'asc' },
            include: {
                permissions: {
                    include: { permission: { select: { code: true, name: true } } },
                },
                _count: { select: { users: true } },
            },
        });
        return roles.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            description: r.description,
            userCount: r._count.users,
            permissions: r.permissions.map((rp) => ({
                code: rp.permission.code,
                name: rp.permission.name,
            })),
        }));
    }
    async create(actorId, dto) {
        const existing = await this.prisma.user.findFirst({
            where: {
                deletedAt: null,
                OR: [
                    { username: dto.username },
                    ...(dto.email ? [{ email: dto.email }] : []),
                ],
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Username or email already exists');
        }
        if (dto.roleIds?.length) {
            await this.ensureRolesExist(dto.roleIds);
        }
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                fullName: dto.fullName,
                email: dto.email,
                isActive: dto.isActive ?? true,
                passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
                passwordHint: dto.password,
                createdById: actorId,
                updatedById: actorId,
                ...(dto.roleIds?.length
                    ? {
                        roles: {
                            create: dto.roleIds.map((roleId) => ({ roleId })),
                        },
                    }
                    : {}),
            },
            select: userSelect,
        });
        return this.mapUser(user);
    }
    async update(actorId, id, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email && dto.email !== user.email) {
            const emailTaken = await this.prisma.user.findFirst({
                where: { email: dto.email, deletedAt: null, NOT: { id } },
            });
            if (emailTaken) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                fullName: dto.fullName,
                email: dto.email,
                isActive: dto.isActive,
                ...(dto.password
                    ? {
                        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
                        passwordHint: dto.password,
                    }
                    : {}),
                updatedById: actorId,
            },
            select: userSelect,
        });
        return this.mapUser(updated);
    }
    async assignRoles(actorId, id, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.ensureRolesExist(dto.roleIds);
        await this.prisma.$transaction([
            this.prisma.userRole.deleteMany({ where: { userId: id } }),
            ...dto.roleIds.map((roleId) => this.prisma.userRole.create({
                data: { userId: id, roleId },
            })),
            this.prisma.user.update({
                where: { id },
                data: { updatedById: actorId },
            }),
        ]);
        const updated = await this.prisma.user.findUniqueOrThrow({
            where: { id },
            select: userSelect,
        });
        return this.mapUser(updated);
    }
    async ensureRolesExist(roleIds) {
        const uniqueIds = [...new Set(roleIds)];
        const count = await this.prisma.role.count({
            where: { id: { in: uniqueIds } },
        });
        if (count !== uniqueIds.length) {
            throw new common_1.BadRequestException('One or more roles are invalid');
        }
    }
    mapUser(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            password: user.passwordHint ?? null,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles: user.roles.map((ur) => ur.role),
            securityQuestions: user.securityQuestions ?? [],
        };
    }
    async setSecurityQuestions(actorId, userId, questions) {
        if (questions.length < 2) {
            throw new common_1.BadRequestException('At least 2 security questions are required');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.$transaction(async (tx) => {
            await tx.userSecurityQuestion.deleteMany({ where: { userId } });
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                await tx.userSecurityQuestion.create({
                    data: {
                        userId,
                        question: q.question.trim(),
                        answerHash: await bcrypt.hash(q.answer.trim().toLowerCase(), BCRYPT_ROUNDS),
                        sortOrder: i,
                    },
                });
            }
            await tx.user.update({
                where: { id: userId },
                data: { updatedById: actorId },
            });
        });
        return { saved: true, count: questions.length };
    }
    async setOwnerRecoveryKey(actorId, recoveryKey) {
        if (recoveryKey.trim().length < 8) {
            throw new common_1.BadRequestException('Recovery key must be at least 8 characters');
        }
        const hash = await bcrypt.hash(recoveryKey.trim(), BCRYPT_ROUNDS);
        await this.prisma.appSetting.upsert({
            where: { key: 'owner_recovery_key_hash' },
            update: { value: hash },
            create: { key: 'owner_recovery_key_hash', value: hash },
        });
        await this.prisma.auditLog.create({
            data: {
                actorId,
                action: 'UPDATE',
                entity: 'OWNER_RECOVERY_KEY',
                entityId: 'owner_recovery_key_hash',
                newValues: { updated: true },
            },
        });
        return { saved: true };
    }
    async getRecoveryKeyStatus() {
        const row = await this.prisma.appSetting.findUnique({
            where: { key: 'owner_recovery_key_hash' },
        });
        return { configured: Boolean(row?.value) };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map