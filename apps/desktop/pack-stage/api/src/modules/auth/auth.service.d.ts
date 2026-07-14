import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(username: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            fullName: string;
            roles: import("@prisma/client").$Enums.RoleCode[];
            permissions: string[];
        };
    }>;
    logout(refreshToken: string): Promise<{
        revoked: boolean;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            fullName: string;
            roles: import("@prisma/client").$Enums.RoleCode[];
            permissions: string[];
        };
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        changed: boolean;
    }>;
    resetPasswordByOwner(actorId: string, targetUserId: string, newPassword: string): Promise<{
        reset: boolean;
    }>;
    getForgotQuestions(username: string): Promise<{
        username: string;
        fullName: string;
        questions: {
            id: string;
            question: string;
        }[];
    }>;
    resetWithSecurityAnswers(input: {
        username: string;
        answers: Array<{
            questionId: string;
            answer: string;
        }>;
        newPassword: string;
    }): Promise<{
        reset: boolean;
        username: string;
    }>;
    resetWithRecoveryKey(input: {
        username: string;
        recoveryKey: string;
        newPassword: string;
    }): Promise<{
        reset: boolean;
        username: string;
    }>;
    private extractPermissions;
    private loadUserWithRoles;
    private jwtExpiresIn;
    private issueTokenPair;
    private resolveRefreshExpiry;
    private findRefreshTokenRecord;
    private revokeAllRefreshTokens;
}
