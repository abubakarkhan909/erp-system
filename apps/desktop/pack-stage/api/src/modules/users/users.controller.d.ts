import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesDto, UpdateUserDto } from './dto/update-user.dto';
import { SetRecoveryKeyDto, SetSecurityQuestionsDto } from './dto/security.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    recoveryStatus(): Promise<{
        configured: boolean;
    }>;
    list(page?: number, pageSize?: number, search?: string, sortBy?: string, sortDir?: 'asc' | 'desc'): Promise<{
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
    create(user: {
        id: string;
    }, dto: CreateUserDto): Promise<{
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
    update(user: {
        id: string;
    }, id: string, dto: UpdateUserDto): Promise<{
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
    assignRoles(user: {
        id: string;
    }, id: string, dto: AssignRolesDto): Promise<{
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
    setQuestions(user: {
        id: string;
    }, id: string, dto: SetSecurityQuestionsDto): Promise<{
        saved: boolean;
        count: number;
    }>;
    setRecoveryKey(user: {
        id: string;
    }, dto: SetRecoveryKeyDto): Promise<{
        saved: boolean;
    }>;
}
