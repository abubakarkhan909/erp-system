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
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions('customers.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.customersService.findAll(query);
  }

  @Get(':id/ledger')
  @RequirePermissions('customers.read')
  getLedger(@Param('id') id: string) {
    return this.customersService.getLedger(id);
  }

  @Get(':id')
  @RequirePermissions('customers.read')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @RequirePermissions('customers.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.customersService.create(body, user.id);
  }

  @Patch(':id')
  @RequirePermissions('customers.write')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.customersService.update(id, body, user.id);
  }

  @Delete(':id')
  @RequirePermissions('customers.write')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.customersService.remove(id, user.id);
  }
}
