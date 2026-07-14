import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountingService, PostJournalInput } from './accounting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('accounting')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('chart-of-accounts')
  @RequirePermissions('accounting.read')
  getChartOfAccounts() {
    return this.accountingService.getChartOfAccounts();
  }

  @Post('journals')
  @RequirePermissions('accounting.write')
  postManualJournal(@Body() body: PostJournalInput, @CurrentUser() user: AuthUser) {
    return this.accountingService.postManualJournal(body, user.id);
  }

  @Get('reports/trial-balance')
  @RequirePermissions('accounting.read')
  trialBalance(@Query('from') from?: string, @Query('to') to?: string) {
    return this.accountingService.getTrialBalance(from, to);
  }

  @Get('reports/profit-and-loss')
  @RequirePermissions('accounting.read')
  profitAndLoss(@Query('from') from?: string, @Query('to') to?: string) {
    return this.accountingService.getProfitAndLoss(from, to);
  }

  @Get('reports/balance-sheet')
  @RequirePermissions('accounting.read')
  balanceSheet(@Query('asOf') asOf?: string) {
    return this.accountingService.getBalanceSheet(asOf);
  }

  @Get('reports/cash-flow')
  @RequirePermissions('accounting.read')
  cashFlow(@Query('from') from?: string, @Query('to') to?: string) {
    return this.accountingService.getCashFlow(from, to);
  }

  @Post('close-period')
  @RequirePermissions('accounting.write')
  closePeriod(
    @Body() body: { year: number; month: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.accountingService.closePeriod(body.year, body.month, user.id);
  }
}
