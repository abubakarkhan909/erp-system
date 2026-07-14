import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NumberSeriesModule } from '../number-series/number-series.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountingModule } from '../accounting/accounting.module';
import { SaleReturnsController } from './sale-returns.controller';
import { SaleReturnsService } from './sale-returns.service';

@Module({
  imports: [AuthModule, NumberSeriesModule, InventoryModule, AccountingModule],
  controllers: [SaleReturnsController],
  providers: [SaleReturnsService],
  exports: [SaleReturnsService],
})
export class SaleReturnsModule {}
