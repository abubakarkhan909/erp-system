"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleReturnsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const number_series_module_1 = require("../number-series/number-series.module");
const inventory_module_1 = require("../inventory/inventory.module");
const accounting_module_1 = require("../accounting/accounting.module");
const sale_returns_controller_1 = require("./sale-returns.controller");
const sale_returns_service_1 = require("./sale-returns.service");
let SaleReturnsModule = class SaleReturnsModule {
};
exports.SaleReturnsModule = SaleReturnsModule;
exports.SaleReturnsModule = SaleReturnsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, number_series_module_1.NumberSeriesModule, inventory_module_1.InventoryModule, accounting_module_1.AccountingModule],
        controllers: [sale_returns_controller_1.SaleReturnsController],
        providers: [sale_returns_service_1.SaleReturnsService],
        exports: [sale_returns_service_1.SaleReturnsService],
    })
], SaleReturnsModule);
//# sourceMappingURL=sale-returns.module.js.map