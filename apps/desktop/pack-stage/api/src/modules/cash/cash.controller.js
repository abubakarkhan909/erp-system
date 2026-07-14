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
exports.CashController = void 0;
const common_1 = require("@nestjs/common");
const cash_service_1 = require("./cash.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CashController = class CashController {
    cashService;
    constructor(cashService) {
        this.cashService = cashService;
    }
    listSessions() {
        return this.cashService.listSessions();
    }
    getOpenSession() {
        return this.cashService.getOpenSession();
    }
    openSession(body, user) {
        return this.cashService.openSession(body, user.id);
    }
    closeSession(body, user) {
        return this.cashService.closeSession(body, user.id);
    }
    cashIn(body, user) {
        return this.cashService.cashIn(body, user.id);
    }
    cashOut(body, user) {
        return this.cashService.cashOut(body, user.id);
    }
};
exports.CashController = CashController;
__decorate([
    (0, common_1.Get)('sessions'),
    (0, permissions_decorator_1.RequirePermissions)('cash.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CashController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Get)('sessions/open'),
    (0, permissions_decorator_1.RequirePermissions)('cash.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CashController.prototype, "getOpenSession", null);
__decorate([
    (0, common_1.Post)('sessions/open'),
    (0, permissions_decorator_1.RequirePermissions)('cash.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CashController.prototype, "openSession", null);
__decorate([
    (0, common_1.Post)('sessions/close'),
    (0, permissions_decorator_1.RequirePermissions)('cash.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CashController.prototype, "closeSession", null);
__decorate([
    (0, common_1.Post)('in'),
    (0, permissions_decorator_1.RequirePermissions)('cash.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CashController.prototype, "cashIn", null);
__decorate([
    (0, common_1.Post)('out'),
    (0, permissions_decorator_1.RequirePermissions)('cash.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CashController.prototype, "cashOut", null);
exports.CashController = CashController = __decorate([
    (0, common_1.Controller)('cash'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [cash_service_1.CashService])
], CashController);
//# sourceMappingURL=cash.controller.js.map