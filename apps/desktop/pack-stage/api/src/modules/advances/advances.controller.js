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
exports.AdvancesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const advances_service_1 = require("./advances.service");
let AdvancesController = class AdvancesController {
    advancesService;
    constructor(advancesService) {
        this.advancesService = advancesService;
    }
    listAdvanceOrders(query) {
        return this.advancesService.listAdvanceOrders(query);
    }
    getAdvanceOrder(id) {
        return this.advancesService.getAdvanceOrder(id);
    }
    createAdvanceOrder(body, user) {
        return this.advancesService.createAdvanceOrder(body, user.id);
    }
    updateAdvanceOrder(id, body, user) {
        return this.advancesService.updateAdvanceOrder(id, body, user.id);
    }
    transitionAdvanceOrderStatus(id, body, user) {
        return this.advancesService.transitionAdvanceOrderStatus(id, body, user.id);
    }
    recordAdvancePayment(id, body, user) {
        return this.advancesService.recordAdvancePayment(id, body, user.id);
    }
    removeAdvanceOrder(id, user) {
        return this.advancesService.removeAdvanceOrder(id, user.id);
    }
    listCustomOrders(query) {
        return this.advancesService.listCustomOrders(query);
    }
    getCustomOrder(id) {
        return this.advancesService.getCustomOrder(id);
    }
    createCustomOrder(body, user) {
        return this.advancesService.createCustomOrder(body, user.id);
    }
    updateCustomOrder(id, body, user) {
        return this.advancesService.updateCustomOrder(id, body, user.id);
    }
    transitionCustomOrderStatus(id, body, user) {
        return this.advancesService.transitionCustomOrderStatus(id, body, user.id);
    }
    listRepairOrders(query) {
        return this.advancesService.listRepairOrders(query);
    }
    getRepairOrder(id) {
        return this.advancesService.getRepairOrder(id);
    }
    createRepairOrder(body, user) {
        return this.advancesService.createRepairOrder(body, user.id);
    }
    updateRepairOrder(id, body, user) {
        return this.advancesService.updateRepairOrder(id, body, user.id);
    }
    transitionRepairOrderStatus(id, body, user) {
        return this.advancesService.transitionRepairOrderStatus(id, body, user.id);
    }
};
exports.AdvancesController = AdvancesController;
__decorate([
    (0, common_1.Get)('advance-orders'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "listAdvanceOrders", null);
__decorate([
    (0, common_1.Get)('advance-orders/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "getAdvanceOrder", null);
__decorate([
    (0, common_1.Post)('advance-orders'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "createAdvanceOrder", null);
__decorate([
    (0, common_1.Patch)('advance-orders/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "updateAdvanceOrder", null);
__decorate([
    (0, common_1.Patch)('advance-orders/:id/status'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "transitionAdvanceOrderStatus", null);
__decorate([
    (0, common_1.Post)('advance-orders/:id/payments'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "recordAdvancePayment", null);
__decorate([
    (0, common_1.Delete)('advance-orders/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "removeAdvanceOrder", null);
__decorate([
    (0, common_1.Get)('custom-orders'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "listCustomOrders", null);
__decorate([
    (0, common_1.Get)('custom-orders/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "getCustomOrder", null);
__decorate([
    (0, common_1.Post)('custom-orders'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "createCustomOrder", null);
__decorate([
    (0, common_1.Patch)('custom-orders/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "updateCustomOrder", null);
__decorate([
    (0, common_1.Patch)('custom-orders/:id/status'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "transitionCustomOrderStatus", null);
__decorate([
    (0, common_1.Get)('repair-orders'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "listRepairOrders", null);
__decorate([
    (0, common_1.Get)('repair-orders/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "getRepairOrder", null);
__decorate([
    (0, common_1.Post)('repair-orders'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "createRepairOrder", null);
__decorate([
    (0, common_1.Patch)('repair-orders/:id'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "updateRepairOrder", null);
__decorate([
    (0, common_1.Patch)('repair-orders/:id/status'),
    (0, permissions_decorator_1.RequirePermissions)('sales.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdvancesController.prototype, "transitionRepairOrderStatus", null);
exports.AdvancesController = AdvancesController = __decorate([
    (0, common_1.Controller)('advances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [advances_service_1.AdvancesService])
], AdvancesController);
//# sourceMappingURL=advances.controller.js.map