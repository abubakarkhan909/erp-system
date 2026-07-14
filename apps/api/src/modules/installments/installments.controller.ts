import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';
import { InstallmentsService } from './installments.service';

@Controller('installments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post('plans')
  @RequirePermissions('sales.write')
  createPlan(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.installmentsService.createPlan(body, user.id);
  }

  @Get('plans')
  @RequirePermissions('sales.read')
  listPlans(@Query() query: Record<string, unknown>) {
    return this.installmentsService.listPlans(query);
  }

  @Get('plans/:id')
  @RequirePermissions('sales.read')
  getPlan(@Param('id') id: string) {
    return this.installmentsService.getPlan(id);
  }

  @Get('plans/:id/schedules')
  @RequirePermissions('sales.read')
  listSchedules(@Param('id') id: string, @Query() query: Record<string, unknown>) {
    return this.installmentsService.listSchedules(id, query);
  }

  @Post('schedules/:id/payments')
  @RequirePermissions('sales.write')
  recordPayment(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.installmentsService.recordPayment(id, body, user.id);
  }

  @Get('upcoming')
  @RequirePermissions('sales.read')
  upcoming(@Query() query: Record<string, unknown>) {
    return this.installmentsService.upcoming(query);
  }

  @Get('late')
  @RequirePermissions('sales.read')
  late(@Query() query: Record<string, unknown>) {
    return this.installmentsService.late(query);
  }
}
