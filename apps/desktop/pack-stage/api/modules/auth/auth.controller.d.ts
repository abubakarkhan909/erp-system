import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotQuestionsDto, ResetWithAnswersDto, ResetWithRecoveryKeyDto } from './dto/forgot-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    logout(dto: RefreshTokenDto): Promise<{
        revoked: boolean;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
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
    forgotQuestions(query: ForgotQuestionsDto): Promise<{
        username: string;
        fullName: string;
        questions: {
            id: string;
            question: string;
        }[];
    }>;
    forgotReset(dto: ResetWithAnswersDto): Promise<{
        reset: boolean;
        username: string;
    }>;
    forgotRecovery(dto: ResetWithRecoveryKeyDto): Promise<{
        reset: boolean;
        username: string;
    }>;
    changePassword(user: {
        id: string;
    }, dto: ChangePasswordDto): Promise<{
        changed: boolean;
    }>;
    resetPassword(user: {
        id: string;
    }, dto: ResetPasswordDto): Promise<{
        reset: boolean;
    }>;
}
