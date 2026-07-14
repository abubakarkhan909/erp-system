import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('reports.read')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  sales(@Query() query: Record<string, unknown>) {
    return this.reportsService.sales(query);
  }

  @Get('purchases')
  purchases(@Query() query: Record<string, unknown>) {
    return this.reportsService.purchases(query);
  }

  @Get('expenses')
  expenses(@Query() query: Record<string, unknown>) {
    return this.reportsService.expenses(query);
  }

  @Get('profit')
  profit(@Query() query: Record<string, unknown>) {
    return this.reportsService.profit(query);
  }

  @Get('inventory')
  inventory(@Query() query: Record<string, unknown>) {
    return this.reportsService.inventory(query);
  }

  @Get('low-stock')
  lowStock(@Query() query: Record<string, unknown>) {
    return this.reportsService.lowStock(query);
  }

  @Get('statements/customers/:id')
  customerStatement(@Param('id') id: string, @Query() query: Record<string, unknown>) {
    return this.reportsService.customerStatement(id, query);
  }

  @Get('statements/suppliers/:id')
  supplierStatement(@Param('id') id: string, @Query() query: Record<string, unknown>) {
    return this.reportsService.supplierStatement(id, query);
  }

  @Get('cash-flow')
  cashFlow(@Query() query: Record<string, unknown>) {
    return this.reportsService.cashFlow(query);
  }

  @Get('installments')
  installments(@Query() query: Record<string, unknown>) {
    return this.reportsService.installments(query);
  }

  @Get('advance-orders')
  advanceOrders(@Query() query: Record<string, unknown>) {
    return this.reportsService.advanceOrders(query);
  }

  @Get('utility-bills')
  utilityBills(@Query() query: Record<string, unknown>) {
    return this.reportsService.utilityBills(query);
  }
}
