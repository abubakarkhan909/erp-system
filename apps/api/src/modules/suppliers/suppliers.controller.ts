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
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermissions('suppliers.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id/ledger')
  @RequirePermissions('suppliers.read')
  getLedger(@Param('id') id: string) {
    return this.suppliersService.getLedger(id);
  }

  @Get(':id')
  @RequirePermissions('suppliers.read')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @RequirePermissions('suppliers.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.suppliersService.create(body, user.id);
  }

  @Patch(':id')
  @RequirePermissions('suppliers.write')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.suppliersService.update(id, body, user.id);
  }

  @Delete(':id')
  @RequirePermissions('suppliers.write')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.suppliersService.remove(id, user.id);
  }
}
