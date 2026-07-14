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
import { UtilityBillsService } from './utility-bills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('utility-bills')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UtilityBillsController {
  constructor(private readonly utilityBillsService: UtilityBillsService) {}

  @Get()
  @RequirePermissions('expenses.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.utilityBillsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('expenses.read')
  findOne(@Param('id') id: string) {
    return this.utilityBillsService.findOne(id);
  }

  @Post()
  @RequirePermissions('expenses.write')
  create(@Body() body: unknown) {
    return this.utilityBillsService.create(body);
  }

  @Patch(':id')
  @RequirePermissions('expenses.write')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.utilityBillsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('expenses.write')
  remove(@Param('id') id: string) {
    return this.utilityBillsService.remove(id);
  }

  @Post(':id/mark-paid')
  @RequirePermissions('expenses.write')
  markPaid(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.utilityBillsService.markPaid(id, body, user.id);
  }
}
