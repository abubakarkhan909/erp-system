import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { UtilityBillsController } from './utility-bills.controller';
import { UtilityBillsService } from './utility-bills.service';

@Module({
  imports: [AuthModule, ExpensesModule],
  controllers: [UtilityBillsController],
  providers: [UtilityBillsService],
  exports: [UtilityBillsService],
})
export class UtilityBillsModule {}
