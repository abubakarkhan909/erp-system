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
import { BanksService } from './banks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('banks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  @RequirePermissions('bank.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.banksService.findAll(query);
  }

  @Post('transfer')
  @RequirePermissions('bank.write')
  transfer(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.banksService.transfer(body, user.id);
  }

  @Get(':id')
  @RequirePermissions('bank.read')
  findOne(@Param('id') id: string) {
    return this.banksService.findOne(id);
  }

  @Post()
  @RequirePermissions('bank.write')
  create(@Body() body: unknown) {
    return this.banksService.create(body);
  }

  @Patch(':id')
  @RequirePermissions('bank.write')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.banksService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('bank.write')
  remove(@Param('id') id: string) {
    return this.banksService.remove(id);
  }

  @Post(':id/deposit')
  @RequirePermissions('bank.write')
  deposit(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.banksService.deposit(id, body, user.id);
  }

  @Post(':id/withdraw')
  @RequirePermissions('bank.write')
  withdraw(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.banksService.withdraw(id, body, user.id);
  }

}
