import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SaleReturnsService } from './sale-returns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('sale-returns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SaleReturnsController {
  constructor(private readonly saleReturnsService: SaleReturnsService) {}

  @Get()
  @RequirePermissions('sales.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.saleReturnsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('sales.read')
  findOne(@Param('id') id: string) {
    return this.saleReturnsService.findOne(id);
  }

  @Post()
  @RequirePermissions('sales.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.saleReturnsService.createFromSale(body, user.id);
  }

  @Post(':id/post')
  @RequirePermissions('sales.post')
  post(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.saleReturnsService.post(id, body, user.id);
  }
}
