import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CashService } from './cash.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('cash')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Get('sessions')
  @RequirePermissions('cash.read')
  listSessions() {
    return this.cashService.listSessions();
  }

  @Get('sessions/open')
  @RequirePermissions('cash.read')
  getOpenSession() {
    return this.cashService.getOpenSession();
  }

  @Post('sessions/open')
  @RequirePermissions('cash.write')
  openSession(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.cashService.openSession(body, user.id);
  }

  @Post('sessions/close')
  @RequirePermissions('cash.write')
  closeSession(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.cashService.closeSession(body, user.id);
  }

  @Post('in')
  @RequirePermissions('cash.write')
  cashIn(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.cashService.cashIn(body, user.id);
  }

  @Post('out')
  @RequirePermissions('cash.write')
  cashOut(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.cashService.cashOut(body, user.id);
  }
}
