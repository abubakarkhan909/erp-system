import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { paginatedResult, parsePagination } from '../../common/utils/pagination';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesDto, UpdateUserDto } from './dto/update-user.dto';

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
    orderBy: { sortOrder: 'asc' as const },
  },
} as const;

type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const { page, pageSize, skip, take, search, sortBy, sortDir } =
      parsePagination(query);

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

    const sortOrder = sortDir as Prisma.SortOrder;
    const orderBy: Prisma.UserOrderByWithRelationInput =
      sortBy === 'username'
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
    return paginatedResult(data, total, page, pageSize);
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

  async create(actorId: string, dto: CreateUserDto) {
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
      throw new ConflictException('Username or email already exists');
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

  async update(actorId: string, id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.prisma.user.findFirst({
        where: { email: dto.email, deletedAt: null, NOT: { id } },
      });
      if (emailTaken) {
        throw new ConflictException('Email already in use');
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

  async assignRoles(actorId: string, id: string, dto: AssignRolesDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.ensureRolesExist(dto.roleIds);

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      ...dto.roleIds.map((roleId) =>
        this.prisma.userRole.create({
          data: { userId: id, roleId },
        }),
      ),
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

  private async ensureRolesExist(roleIds: string[]) {
    const uniqueIds = [...new Set(roleIds)];
    const count = await this.prisma.role.count({
      where: { id: { in: uniqueIds } },
    });

    if (count !== uniqueIds.length) {
      throw new BadRequestException('One or more roles are invalid');
    }
  }

  private mapUser(user: UserRow) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      /** Owner vault — current known password note (offline shop recovery). */
      password: user.passwordHint ?? null,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map((ur) => ur.role),
      securityQuestions: user.securityQuestions ?? [],
    };
  }

  async setSecurityQuestions(
    actorId: string,
    userId: string,
    questions: Array<{ question: string; answer: string }>,
  ) {
    if (questions.length < 2) {
      throw new BadRequestException('At least 2 security questions are required');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.userSecurityQuestion.deleteMany({ where: { userId } });
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]!;
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

  async setOwnerRecoveryKey(actorId: string, recoveryKey: string) {
    if (recoveryKey.trim().length < 8) {
      throw new BadRequestException('Recovery key must be at least 8 characters');
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
}
