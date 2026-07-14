import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginatedResult, parsePagination } from '../../common/utils/pagination';

export interface AuditLogInput {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ip?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput) {
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

  async list(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    entity?: string;
    entityId?: string;
    actorId?: string;
  }) {
    const { page, pageSize, skip, take, search, sortBy, sortDir } =
      parsePagination(query);

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

    const sortOrder = sortDir as Prisma.SortOrder;
    const orderBy: Prisma.AuditLogOrderByWithRelationInput =
      sortBy === 'action'
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

    return paginatedResult(rows, total, page, pageSize);
  }
}
