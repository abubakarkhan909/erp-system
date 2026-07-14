"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanksModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const accounting_module_1 = require("../accounting/accounting.module");
const banks_controller_1 = require("./banks.controller");
const banks_service_1 = require("./banks.service");
let BanksModule = class BanksModule {
};
exports.BanksModule = BanksModule;
exports.BanksModule = BanksModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, accounting_module_1.AccountingModule],
        controllers: [banks_controller_1.BanksController],
        providers: [banks_service_1.BanksService],
        exports: [banks_service_1.BanksService],
    })
], BanksModule);
//# sourceMappingURL=banks.module.js.map