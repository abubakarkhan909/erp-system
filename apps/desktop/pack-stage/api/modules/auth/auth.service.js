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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const BCRYPT_ROUNDS = 10;
const userWithRolesInclude = {
    roles: {
        include: {
            role: {
                include: {
                    permissions: { include: { permission: true } },
                },
            },
        },
    },
};
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(username, password) {
        const user = await this.loadUserWithRoles({ username, deletedAt: null });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const permissions = this.extractPermissions(user);
        const tokens = await this.issueTokenPair(user.id, user.username, permissions);
        return {
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                roles: user.roles.map((ur) => ur.role.code),
                permissions,
            },
            ...tokens,
        };
    }
    async logout(refreshToken) {
        const record = await this.findRefreshTokenRecord(refreshToken);
        if (!record || record.revokedAt) {
            return { revoked: false };
        }
        await this.prisma.refreshToken.update({
            where: { id: record.id },
            data: { revokedAt: new Date() },
        });
        return { revoked: true };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (!payload.tid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const record = await this.prisma.refreshToken.findUnique({
            where: { id: payload.tid },
        });
        if (!record ||
            record.revokedAt ||
            record.expiresAt < new Date() ||
            record.userId !== payload.sub) {
            throw new common_1.UnauthorizedException('Refresh token expired or revoked');
        }
        const hashMatch = await bcrypt.compare(refreshToken, record.tokenHash);
        if (!hashMatch) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        await this.prisma.refreshToken.update({
            where: { id: record.id },
            data: { revokedAt: new Date() },
        });
        const user = await this.loadUserWithRoles({
            id: payload.sub,
            deletedAt: null,
            isActive: true,
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        const permissions = this.extractPermissions(user);
        const tokens = await this.issueTokenPair(user.id, user.username, permissions);
        return {
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                roles: user.roles.map((ur) => ur.role.code),
                permissions,
            },
            ...tokens,
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null, isActive: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
                passwordHint: newPassword,
                updatedById: userId,
            },
        });
        await this.revokeAllRefreshTokens(userId);
        return { changed: true };
    }
    async resetPasswordByOwner(actorId, targetUserId, newPassword) {
        const target = await this.prisma.user.findFirst({
            where: { id: targetUserId, deletedAt: null },
        });
        if (!target) {
            throw new common_1.BadRequestException('User not found');
        }
        await this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
                passwordHint: newPassword,
                updatedById: actorId,
            },
        });
        await this.revokeAllRefreshTokens(targetUserId);
        return { reset: true };
    }
    async getForgotQuestions(username) {
        const user = await this.prisma.user.findFirst({
            where: { username, deletedAt: null, isActive: true },
            include: {
                securityQuestions: { orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('If this account exists, security questions will appear. None found or not configured.');
        }
        if (user.securityQuestions.length === 0) {
            throw new common_1.BadRequestException('No security questions set for this user. Ask the Owner to reset your password or set questions.');
        }
        return {
            username: user.username,
            fullName: user.fullName,
            questions: user.securityQuestions.map((q) => ({
                id: q.id,
                question: q.question,
            })),
        };
    }
    async resetWithSecurityAnswers(input) {
        if (input.newPassword.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters');
        }
        const user = await this.prisma.user.findFirst({
            where: { username: input.username, deletedAt: null, isActive: true },
            include: { securityQuestions: true },
        });
        if (!user || user.securityQuestions.length === 0) {
            throw new common_1.BadRequestException('Unable to reset password');
        }
        if (input.answers.length < Math.min(2, user.securityQuestions.length)) {
            throw new common_1.BadRequestException('Answer at least 2 security questions');
        }
        let matched = 0;
        for (const a of input.answers) {
            const q = user.securityQuestions.find((x) => x.id === a.questionId);
            if (!q)
                continue;
            const ok = await bcrypt.compare(a.answer.trim().toLowerCase(), q.answerHash);
            if (ok)
                matched += 1;
        }
        const required = Math.min(2, user.securityQuestions.length);
        if (matched < required) {
            throw new common_1.UnauthorizedException('Security answers are incorrect');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS),
                passwordHint: input.newPassword,
            },
        });
        await this.revokeAllRefreshTokens(user.id);
        return { reset: true, username: user.username };
    }
    async resetWithRecoveryKey(input) {
        if (input.newPassword.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters');
        }
        const setting = await this.prisma.appSetting.findUnique({
            where: { key: 'owner_recovery_key_hash' },
        });
        if (!setting?.value) {
            throw new common_1.BadRequestException('Owner recovery key is not configured');
        }
        const keyOk = await bcrypt.compare(input.recoveryKey.trim(), setting.value);
        if (!keyOk) {
            throw new common_1.UnauthorizedException('Invalid recovery key');
        }
        const user = await this.prisma.user.findFirst({
            where: { username: input.username, deletedAt: null },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS),
                passwordHint: input.newPassword,
            },
        });
        await this.revokeAllRefreshTokens(user.id);
        await this.prisma.auditLog.create({
            data: {
                action: 'RESET_PASSWORD',
                entity: 'USER',
                entityId: user.id,
                newValues: { via: 'recovery_key', username: user.username },
            },
        });
        return { reset: true, username: user.username };
    }
    extractPermissions(user) {
        return [
            ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code))),
        ];
    }
    loadUserWithRoles(where) {
        return this.prisma.user.findFirst({
            where,
            include: userWithRolesInclude,
        });
    }
    jwtExpiresIn(key, fallback) {
        return (this.configService.get(key) ?? fallback);
    }
    async issueTokenPair(userId, username, permissions) {
        const accessPayload = {
            sub: userId,
            username,
            permissions,
        };
        const accessToken = this.jwtService.sign(accessPayload, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
            expiresIn: this.jwtExpiresIn('JWT_EXPIRES_IN', '15m'),
        });
        const tokenId = crypto.randomUUID();
        const refreshPayload = {
            sub: userId,
            username,
            permissions,
            tid: tokenId,
        };
        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: this.jwtExpiresIn('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        const expiresAt = this.resolveRefreshExpiry();
        await this.prisma.refreshToken.create({
            data: {
                id: tokenId,
                userId,
                tokenHash: await bcrypt.hash(refreshToken, BCRYPT_ROUNDS),
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    resolveRefreshExpiry() {
        const raw = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const match = /^(\d+)([smhd])$/.exec(raw);
        if (!match) {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        const value = Number(match[1]);
        const unit = match[2];
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return new Date(Date.now() + value * multipliers[unit]);
    }
    async findRefreshTokenRecord(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            return null;
        }
        if (!payload.tid) {
            return null;
        }
        const record = await this.prisma.refreshToken.findUnique({
            where: { id: payload.tid },
        });
        if (!record) {
            return null;
        }
        const hashMatch = await bcrypt.compare(refreshToken, record.tokenHash);
        if (!hashMatch) {
            return null;
        }
        return record;
    }
    async revokeAllRefreshTokens(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map