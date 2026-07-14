import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionCode } from '@jewelry-erp/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions.guard';
import {
  ForgotQuestionsDto,
  ResetWithAnswersDto,
  ResetWithRecoveryKeyDto,
} from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('forgot-questions')
  forgotQuestions(@Query() query: ForgotQuestionsDto) {
    return this.authService.getForgotQuestions(query.username);
  }

  @Post('forgot-reset')
  forgotReset(@Body() dto: ResetWithAnswersDto) {
    return this.authService.resetWithSecurityAnswers(dto);
  }

  @Post('forgot-recovery')
  forgotRecovery(@Body() dto: ResetWithRecoveryKeyDto) {
    return this.authService.resetWithRecoveryKey(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  resetPassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPasswordByOwner(
      user.id,
      dto.userId,
      dto.newPassword,
    );
  }
}
