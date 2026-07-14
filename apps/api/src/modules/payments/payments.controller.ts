import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@jewelry-erp/shared';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('customers')
  @RequirePermissions('payments.write')
  recordCustomerPayment(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.paymentsService.recordCustomerPayment(body, user.id);
  }

  @Post('suppliers')
  @RequirePermissions('payments.write')
  recordSupplierPayment(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.paymentsService.recordSupplierPayment(body, user.id);
  }
}
