import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockMovementType } from '@prisma/client';
import { InventoryService, AdjustStockInput } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  @RequirePermissions('inventory.read')
  listMovements(@Query() query: Record<string, unknown>) {
    return this.inventoryService.listMovements(query);
  }

  @Get('balances')
  @RequirePermissions('inventory.read')
  getBalances(@Query() query: Record<string, unknown>) {
    return this.inventoryService.getBalances(query);
  }

  @Get('low-stock')
  @RequirePermissions('inventory.read')
  getLowStock() {
    return this.inventoryService.getLowStock();
  }

  /** Add own / workshop / opening stock (no supplier purchase). */
  @Post('own-stock')
  @RequirePermissions('inventory.write')
  addOwnStock(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.inventoryService.addOwnStock(body, user.id);
  }

  @Post('adjust')
  @RequirePermissions('inventory.write')
  adjust(
    @Body()
    body: {
      productId: string;
      type: StockMovementType;
      qty: string;
      weight: string;
      refType?: string;
      refId?: string;
      notes?: string;
    },
    @CurrentUser() user: AuthUser,
  ) {
    const input: AdjustStockInput = { ...body, createdById: user.id };
    return this.inventoryService.manualAdjustment(input);
  }
}
