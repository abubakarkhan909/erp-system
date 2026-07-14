import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchaseReturnsService } from './purchase-returns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('purchase-returns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseReturnsController {
  constructor(private readonly purchaseReturnsService: PurchaseReturnsService) {}

  @Get()
  @RequirePermissions('purchases.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.purchaseReturnsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('purchases.read')
  findOne(@Param('id') id: string) {
    return this.purchaseReturnsService.findOne(id);
  }

  @Post()
  @RequirePermissions('purchases.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.purchaseReturnsService.createFromPurchase(body, user.id);
  }

  @Post(':id/post')
  @RequirePermissions('purchases.post')
  post(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchaseReturnsService.post(id, body, user.id);
  }
}
