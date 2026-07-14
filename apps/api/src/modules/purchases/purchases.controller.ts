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
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('purchases')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @RequirePermissions('purchases.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.purchasesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('purchases.read')
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Post()
  @RequirePermissions('purchases.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.purchasesService.createDraft(body, user.id);
  }

  @Patch(':id')
  @RequirePermissions('purchases.write')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchasesService.updateDraft(id, body, user.id);
  }

  @Post(':id/post')
  @RequirePermissions('purchases.post')
  post(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchasesService.post(id, body, user.id);
  }

  @Post(':id/void')
  @RequirePermissions('purchases.void')
  void(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.purchasesService.voidPosted(id, user.id);
  }
}
