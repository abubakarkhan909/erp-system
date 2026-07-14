import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './jwt.strategy';

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
} satisfies Prisma.UserInclude;

type UserWithRoles = Prisma.UserGetPayload<{ include: typeof userWithRolesInclude }>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.loadUserWithRoles({ username, deletedAt: null });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
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

  async logout(refreshToken: string) {
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

  async refresh(refreshToken: string) {
    let payload: JwtPayload & { tid?: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload.tid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const record = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tid },
    });

    if (
      !record ||
      record.revokedAt ||
      record.expiresAt < new Date() ||
      record.userId !== payload.sub
    ) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const hashMatch = await bcrypt.compare(refreshToken, record.tokenHash);
    if (!hashMatch) {
      throw new UnauthorizedException('Invalid refresh token');
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
      throw new UnauthorizedException('User not found or inactive');
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
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

  async resetPasswordByOwner(
    actorId: string,
    targetUserId: string,
    newPassword: string,
  ) {
    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
    });

    if (!target) {
      throw new BadRequestException('User not found');
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

  /** Public: return security question texts for a username (no answers). */
  async getForgotQuestions(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { username, deletedAt: null, isActive: true },
      include: {
        securityQuestions: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!user) {
      // Do not reveal whether username exists
      throw new BadRequestException('If this account exists, security questions will appear. None found or not configured.');
    }

    if (user.securityQuestions.length === 0) {
      throw new BadRequestException(
        'No security questions set for this user. Ask the Owner to reset your password or set questions.',
      );
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

  /** Public: verify answers (need all correct) then set new password. */
  async resetWithSecurityAnswers(input: {
    username: string;
    answers: Array<{ questionId: string; answer: string }>;
    newPassword: string;
  }) {
    if (input.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const user = await this.prisma.user.findFirst({
      where: { username: input.username, deletedAt: null, isActive: true },
      include: { securityQuestions: true },
    });

    if (!user || user.securityQuestions.length === 0) {
      throw new BadRequestException('Unable to reset password');
    }

    if (input.answers.length < Math.min(2, user.securityQuestions.length)) {
      throw new BadRequestException('Answer at least 2 security questions');
    }

    let matched = 0;
    for (const a of input.answers) {
      const q = user.securityQuestions.find((x) => x.id === a.questionId);
      if (!q) continue;
      const ok = await bcrypt.compare(a.answer.trim().toLowerCase(), q.answerHash);
      if (ok) matched += 1;
    }

    const required = Math.min(2, user.securityQuestions.length);
    if (matched < required) {
      throw new UnauthorizedException('Security answers are incorrect');
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

  /** Public: reset using Owner hidden recovery key. */
  async resetWithRecoveryKey(input: {
    username: string;
    recoveryKey: string;
    newPassword: string;
  }) {
    if (input.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'owner_recovery_key_hash' },
    });
    if (!setting?.value) {
      throw new BadRequestException('Owner recovery key is not configured');
    }

    const keyOk = await bcrypt.compare(input.recoveryKey.trim(), setting.value);
    if (!keyOk) {
      throw new UnauthorizedException('Invalid recovery key');
    }

    const user = await this.prisma.user.findFirst({
      where: { username: input.username, deletedAt: null },
    });
    if (!user) {
      throw new BadRequestException('User not found');
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

  private extractPermissions(user: NonNullable<UserWithRoles>): string[] {
    return [
      ...new Set(
        user.roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.code),
        ),
      ),
    ];
  }

  private loadUserWithRoles(where: {
    id?: string;
    username?: string;
    deletedAt: null;
    isActive?: boolean;
  }) {
    return this.prisma.user.findFirst({
      where,
      include: userWithRolesInclude,
    });
  }

  private jwtExpiresIn(key: 'JWT_EXPIRES_IN' | 'JWT_REFRESH_EXPIRES_IN', fallback: string) {
    return (this.configService.get(key) ?? fallback) as `${number}${'s' | 'm' | 'h' | 'd'}`;
  }

  private async issueTokenPair(
    userId: string,
    username: string,
    permissions: string[],
  ): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: userId,
      username,
      permissions,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
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
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
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

  private resolveRefreshExpiry(): Date {
    const raw = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const match = /^(\d+)([smhd])$/.exec(raw);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]!);
  }

  private async findRefreshTokenRecord(refreshToken: string) {
    let payload: JwtPayload & { tid?: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
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

  private async revokeAllRefreshTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
