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
exports.InstallmentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const installments_service_1 = require("./installments.service");
let InstallmentsController = class InstallmentsController {
    installmentsService;
    constructor(installmentsService) {
        this.installmentsService = installmentsService;
    }
    createPlan(body, user) {
        return this.installmentsService.createPlan(body, user.id);
    }
    listPlans(query) {
        return this.installmentsService.listPlans(query);
    }
    getPlan(id) {
        return this.installmentsService.getPlan(id);
    }
    listSchedules(id, query) {
        return this.installmentsService.listSchedules(id, query);
    }
    recordPayment(id, body, user) {
        return this.installmentsService.recordPayment(id, body, user.id);
    }
    upcoming(query) {
        return this.installmentsService.upcoming(query);
    }
    late(query) {
        return this.installmentsService.late(query);
    }
};
exports.InstallmentsController = InstallmentsController;
__decorate([
    (0, common_1.Post)('plans'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('plans'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Get)('plans/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Get)('plans/:id/schedules'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "listSchedules", null);
__decorate([
    (0, common_1.Post)('schedules/:id/payments'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "upcoming", null);
__decorate([
    (0, common_1.Get)('late'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "late", null);
exports.InstallmentsController = InstallmentsController = __decorate([
    (0, common_1.Controller)('installments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [installments_service_1.InstallmentsService])
], InstallmentsController);
//# sourceMappingURL=installments.controller.js.map