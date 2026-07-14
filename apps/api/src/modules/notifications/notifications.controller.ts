import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions('reports.read')
  list(@Query() query: Record<string, unknown>, @CurrentUser() user: AuthUser) {
    return this.notificationsService.list(query, user.id);
  }

  @Patch(':id/read')
  @RequirePermissions('reports.read')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.notificationsService.markRead(id, user.id);
  }

  @Post('scan')
  @RequirePermissions('settings.manage')
  scanAndCreate() {
    return this.notificationsService.scanAndCreate();
  }
}
