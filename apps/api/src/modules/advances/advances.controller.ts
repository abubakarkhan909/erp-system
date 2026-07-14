import {
  Body,
  Controller,
  Delete,
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
import { AdvancesService } from './advances.service';

@Controller('advances')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdvancesController {
  constructor(private readonly advancesService: AdvancesService) {}

  @Get('advance-orders')
  @RequirePermissions('sales.read')
  listAdvanceOrders(@Query() query: Record<string, unknown>) {
    return this.advancesService.listAdvanceOrders(query);
  }

  @Get('advance-orders/:id')
  @RequirePermissions('sales.read')
  getAdvanceOrder(@Param('id') id: string) {
    return this.advancesService.getAdvanceOrder(id);
  }

  @Post('advance-orders')
  @RequirePermissions('sales.write')
  createAdvanceOrder(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.advancesService.createAdvanceOrder(body, user.id);
  }

  @Patch('advance-orders/:id')
  @RequirePermissions('sales.write')
  updateAdvanceOrder(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.advancesService.updateAdvanceOrder(id, body, user.id);
  }

  @Patch('advance-orders/:id/status')
  @RequirePermissions('sales.write')
  transitionAdvanceOrderStatus(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.advancesService.transitionAdvanceOrderStatus(id, body, user.id);
  }

  @Post('advance-orders/:id/payments')
  @RequirePermissions('sales.write')
  recordAdvancePayment(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.advancesService.recordAdvancePayment(id, body, user.id);
  }

  @Delete('advance-orders/:id')
  @RequirePermissions('sales.write')
  removeAdvanceOrder(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.advancesService.removeAdvanceOrder(id, user.id);
  }

  @Get('custom-orders')
  @RequirePermissions('sales.read')
  listCustomOrders(@Query() query: Record<string, unknown>) {
    return this.advancesService.listCustomOrders(query);
  }

  @Get('custom-orders/:id')
  @RequirePermissions('sales.read')
  getCustomOrder(@Param('id') id: string) {
    return this.advancesService.getCustomOrder(id);
  }

  @Post('custom-orders')
  @RequirePermissions('sales.write')
  createCustomOrder(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.advancesService.createCustomOrder(body, user.id);
  }

  @Patch('custom-orders/:id')
  @RequirePermissions('sales.write')
  updateCustomOrder(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.advancesService.updateCustomOrder(id, body, user.id);
  }

  @Patch('custom-orders/:id/status')
  @RequirePermissions('sales.write')
  transitionCustomOrderStatus(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.advancesService.transitionCustomOrderStatus(id, body, user.id);
  }

  @Get('repair-orders')
  @RequirePermissions('sales.read')
  listRepairOrders(@Query() query: Record<string, unknown>) {
    return this.advancesService.listRepairOrders(query);
  }

  @Get('repair-orders/:id')
  @RequirePermissions('sales.read')
  getRepairOrder(@Param('id') id: string) {
    return this.advancesService.getRepairOrder(id);
  }

  @Post('repair-orders')
  @RequirePermissions('sales.write')
  createRepairOrder(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.advancesService.createRepairOrder(body, user.id);
  }

  @Patch('repair-orders/:id')
  @RequirePermissions('sales.write')
  updateRepairOrder(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.advancesService.updateRepairOrder(id, body, user.id);
  }

  @Patch('repair-orders/:id/status')
  @RequirePermissions('sales.write')
  transitionRepairOrderStatus(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.advancesService.transitionRepairOrderStatus(id, body, user.id);
  }
}
