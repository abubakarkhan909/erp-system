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
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('expenses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('categories')
  @RequirePermissions('expenses.read')
  listCategories() {
    return this.expensesService.listCategories();
  }

  @Get()
  @RequirePermissions('expenses.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.expensesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('expenses.read')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @RequirePermissions('expenses.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.expensesService.create(body, user.id);
  }

  @Patch(':id')
  @RequirePermissions('expenses.write')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.expensesService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('expenses.write')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
