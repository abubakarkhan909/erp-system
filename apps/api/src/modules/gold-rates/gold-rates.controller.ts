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
import { GoldRatesService } from './gold-rates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('gold-rates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GoldRatesController {
  constructor(private readonly goldRatesService: GoldRatesService) {}

  @Get('latest')
  @RequirePermissions('products.read')
  findLatest() {
    return this.goldRatesService.findLatest();
  }

  @Get('by-date/:date')
  @RequirePermissions('products.read')
  findByDate(@Param('date') date: string) {
    return this.goldRatesService.findByDate(date);
  }

  @Get()
  @RequirePermissions('products.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.goldRatesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@Param('id') id: string) {
    return this.goldRatesService.findOne(id);
  }

  @Post()
  @RequirePermissions('products.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.goldRatesService.create(body, user.id);
  }

  @Patch(':id')
  @RequirePermissions('products.write')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.goldRatesService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('products.write')
  remove(@Param('id') id: string) {
    return this.goldRatesService.remove(id);
  }
}
