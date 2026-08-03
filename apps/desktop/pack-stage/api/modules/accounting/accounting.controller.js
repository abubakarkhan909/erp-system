"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const accounting_service_1 = require("./accounting.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AccountingController = class AccountingController {
    accountingService;
    constructor(accountingService) {
        this.accountingService = accountingService;
    }
    getChartOfAccounts() {
        return this.accountingService.getChartOfAccounts();
    }
    postManualJournal(body, user) {
        return this.accountingService.postManualJournal(body, user.id);
    }
    trialBalance(from, to) {
        return this.accountingService.getTrialBalance(from, to);
    }
    profitAndLoss(from, to) {
        return this.accountingService.getProfitAndLoss(from, to);
    }
    balanceSheet(asOf) {
        return this.accountingService.getBalanceSheet(asOf);
    }
    cashFlow(from, to) {
        return this.accountingService.getCashFlow(from, to);
    }
    closePeriod(body, user) {
        return this.accountingService.closePeriod(body.year, body.month, user.id);
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, common_1.Get)('chart-of-accounts'),
    (0, permissions_decorator_1.RequirePermissions)('accounting.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getChartOfAccounts", null);
__decorate([
    (0, common_1.Post)('journals'),
    (0, permissions_decorator_1.RequirePermissions)('accounting.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "postManualJournal", null);
__decorate([
    (0, common_1.Get)('reports/trial-balance'),
    (0, permissions_decorator_1.RequirePermissions)('accounting.read'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "trialBalance", null);
__decorate([
    (0, common_1.Get)('reports/profit-and-loss'),
    (0, permissions_decorator_1.RequirePermissions)('accounting.read'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "profitAndLoss", null);
__decorate([
    (0, common_1.Get)('reports/balance-sheet'),
    (0, permissions_decorator_1.RequirePermissions)('accounting.read'),
    __param(0, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "balanceSheet", null);
__decorate([
    (0, common_1.Get)('reports/cash-flow'),
    (0, permissions_decorator_1.RequirePermissions)('accounting.read'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "cashFlow", null);
__decorate([
    (0, common_1.Post)('close-period'),
    (0, permissions_decorator_1.RequirePermissions)('accounting.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "closePeriod", null);
exports.AccountingController = AccountingController = __decorate([
    (0, common_1.Controller)('accounting'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map