import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @RequirePermissions('sales.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('sales.read')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  @RequirePermissions('sales.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.salesService.createDraft(body, user.id);
  }

  @Patch(':id')
  @RequirePermissions('sales.write')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.salesService.updateDraft(id, body, user.id);
  }

  @Post(':id/post')
  @RequirePermissions('sales.post')
  post(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.salesService.post(id, body, user.id);
  }

  @Post(':id/void')
  @RequirePermissions('sales.void')
  void(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.salesService.voidPosted(id, user.id);
  }
}
