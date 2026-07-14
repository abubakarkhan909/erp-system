import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';
import { ExchangesService } from './exchanges.service';

@Controller('exchanges')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Get()
  @RequirePermissions('sales.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.exchangesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('sales.read')
  findOne(@Param('id') id: string) {
    return this.exchangesService.findOne(id);
  }

  @Post()
  @RequirePermissions('sales.write')
  create(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.exchangesService.create(body, user.id);
  }

  @Post(':id/post')
  @RequirePermissions('sales.post')
  post(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.exchangesService.post(id, body, user.id);
  }
}
