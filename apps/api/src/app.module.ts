import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompanySettingsModule } from './modules/company-settings/company-settings.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { GoldRatesModule } from './modules/gold-rates/gold-rates.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { SaleReturnsModule } from './modules/sale-returns/sale-returns.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { PurchaseReturnsModule } from './modules/purchase-returns/purchase-returns.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CashModule } from './modules/cash/cash.module';
import { BanksModule } from './modules/banks/banks.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { UtilityBillsModule } from './modules/utility-bills/utility-bills.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { VatModule } from './modules/vat/vat.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdvancesModule } from './modules/advances/advances.module';
import { InstallmentsModule } from './modules/installments/installments.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { BarcodesModule } from './modules/barcodes/barcodes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BackupsModule } from './modules/backups/backups.module';
import { AuditModule } from './modules/audit/audit.module';
import { NumberSeriesModule } from './modules/number-series/number-series.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        process.env.DOTENV_CONFIG_PATH,
        '.env',
      ].filter(Boolean) as string[],
    }),
    PrismaModule,
    NumberSeriesModule,
    AuthModule,
    UsersModule,
    CompanySettingsModule,
    CustomersModule,
    SuppliersModule,
    CatalogModule,
    GoldRatesModule,
    InventoryModule,
    SalesModule,
    SaleReturnsModule,
    PurchasesModule,
    PurchaseReturnsModule,
    PaymentsModule,
    CashModule,
    BanksModule,
    ExpensesModule,
    UtilityBillsModule,
    AccountingModule,
    VatModule,
    ReportsModule,
    AdvancesModule,
    InstallmentsModule,
    ExchangesModule,
    BarcodesModule,
    NotificationsModule,
    BackupsModule,
    AuditModule,
    DashboardModule,
    AttachmentsModule,
  ],
})
export class AppModule {}
