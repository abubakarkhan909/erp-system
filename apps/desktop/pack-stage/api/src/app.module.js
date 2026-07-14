"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const company_settings_module_1 = require("./modules/company-settings/company-settings.module");
const customers_module_1 = require("./modules/customers/customers.module");
const suppliers_module_1 = require("./modules/suppliers/suppliers.module");
const catalog_module_1 = require("./modules/catalog/catalog.module");
const gold_rates_module_1 = require("./modules/gold-rates/gold-rates.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const sales_module_1 = require("./modules/sales/sales.module");
const sale_returns_module_1 = require("./modules/sale-returns/sale-returns.module");
const purchases_module_1 = require("./modules/purchases/purchases.module");
const purchase_returns_module_1 = require("./modules/purchase-returns/purchase-returns.module");
const payments_module_1 = require("./modules/payments/payments.module");
const cash_module_1 = require("./modules/cash/cash.module");
const banks_module_1 = require("./modules/banks/banks.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const utility_bills_module_1 = require("./modules/utility-bills/utility-bills.module");
const accounting_module_1 = require("./modules/accounting/accounting.module");
const vat_module_1 = require("./modules/vat/vat.module");
const reports_module_1 = require("./modules/reports/reports.module");
const advances_module_1 = require("./modules/advances/advances.module");
const installments_module_1 = require("./modules/installments/installments.module");
const exchanges_module_1 = require("./modules/exchanges/exchanges.module");
const barcodes_module_1 = require("./modules/barcodes/barcodes.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const backups_module_1 = require("./modules/backups/backups.module");
const audit_module_1 = require("./modules/audit/audit.module");
const number_series_module_1 = require("./modules/number-series/number-series.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const attachments_module_1 = require("./modules/attachments/attachments.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [
                    process.env.DOTENV_CONFIG_PATH,
                    '.env',
                ].filter(Boolean),
            }),
            prisma_module_1.PrismaModule,
            number_series_module_1.NumberSeriesModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            company_settings_module_1.CompanySettingsModule,
            customers_module_1.CustomersModule,
            suppliers_module_1.SuppliersModule,
            catalog_module_1.CatalogModule,
            gold_rates_module_1.GoldRatesModule,
            inventory_module_1.InventoryModule,
            sales_module_1.SalesModule,
            sale_returns_module_1.SaleReturnsModule,
            purchases_module_1.PurchasesModule,
            purchase_returns_module_1.PurchaseReturnsModule,
            payments_module_1.PaymentsModule,
            cash_module_1.CashModule,
            banks_module_1.BanksModule,
            expenses_module_1.ExpensesModule,
            utility_bills_module_1.UtilityBillsModule,
            accounting_module_1.AccountingModule,
            vat_module_1.VatModule,
            reports_module_1.ReportsModule,
            advances_module_1.AdvancesModule,
            installments_module_1.InstallmentsModule,
            exchanges_module_1.ExchangesModule,
            barcodes_module_1.BarcodesModule,
            notifications_module_1.NotificationsModule,
            backups_module_1.BackupsModule,
            audit_module_1.AuditModule,
            dashboard_module_1.DashboardModule,
            attachments_module_1.AttachmentsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map