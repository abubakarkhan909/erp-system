import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesDto, UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: {
        page?: number;
        pageSize?: number;
        search?: string;
        sortBy?: string;
        sortDir?: 'asc' | 'desc';
    }): Promise<{
        data: {
            id: string;
            username: string;
            email: string | null;
            fullName: string;
            password: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            roles: {
                id: string;
                name: string;
                code: import("@prisma/client").$Enums.RoleCode;
            }[];
            securityQuestions: {
                id: string;
                sortOrder: number;
                question: string;
            }[];
        }[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    listRoles(): Promise<{
        id: string;
        code: import("@prisma/client").$Enums.RoleCode;
        name: string;
        description: string | null;
        userCount: number;
        permissions: {
            code: string;
            name: string;
        }[];
    }[]>;
    create(actorId: string, dto: CreateUserDto): Promise<{
        id: string;
        username: string;
        email: string | null;
        fullName: string;
        password: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            id: string;
            name: string;
            code: import("@prisma/client").$Enums.RoleCode;
        }[];
        securityQuestions: {
            id: string;
            sortOrder: number;
            question: string;
        }[];
    }>;
    update(actorId: string, id: string, dto: UpdateUserDto): Promise<{
        id: string;
        username: string;
        email: string | null;
        fullName: string;
        password: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            id: string;
            name: string;
            code: import("@prisma/client").$Enums.RoleCode;
        }[];
        securityQuestions: {
            id: string;
            sortOrder: number;
            question: string;
        }[];
    }>;
    assignRoles(actorId: string, id: string, dto: AssignRolesDto): Promise<{
        id: string;
        username: string;
        email: string | null;
        fullName: string;
        password: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            id: string;
            name: string;
            code: import("@prisma/client").$Enums.RoleCode;
        }[];
        securityQuestions: {
            id: string;
            sortOrder: number;
            question: string;
        }[];
    }>;
    private ensureRolesExist;
    private mapUser;
    setSecurityQuestions(actorId: string, userId: string, questions: Array<{
        question: string;
        answer: string;
    }>): Promise<{
        saved: boolean;
        count: number;
    }>;
    setOwnerRecoveryKey(actorId: string, recoveryKey: string): Promise<{
        saved: boolean;
    }>;
    getRecoveryKeyStatus(): Promise<{
        configured: boolean;
    }>;
}
