import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NumberSeriesModule } from '../number-series/number-series.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountingModule } from '../accounting/accounting.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [AuthModule, NumberSeriesModule, InventoryModule, AccountingModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
