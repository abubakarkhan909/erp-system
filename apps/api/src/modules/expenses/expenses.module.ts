import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NumberSeriesModule } from '../number-series/number-series.module';
import { AccountingModule } from '../accounting/accounting.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [AuthModule, NumberSeriesModule, AccountingModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
