"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilityBillsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const expenses_module_1 = require("../expenses/expenses.module");
const utility_bills_controller_1 = require("./utility-bills.controller");
const utility_bills_service_1 = require("./utility-bills.service");
let UtilityBillsModule = class UtilityBillsModule {
};
exports.UtilityBillsModule = UtilityBillsModule;
exports.UtilityBillsModule = UtilityBillsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, expenses_module_1.ExpensesModule],
        controllers: [utility_bills_controller_1.UtilityBillsController],
        providers: [utility_bills_service_1.UtilityBillsService],
        exports: [utility_bills_service_1.UtilityBillsService],
    })
], UtilityBillsModule);
//# sourceMappingURL=utility-bills.module.js.map