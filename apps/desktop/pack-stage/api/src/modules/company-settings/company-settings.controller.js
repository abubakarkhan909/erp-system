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
exports.CompanySettingsController = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@jewelry-erp/shared");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const company_settings_service_1 = require("./company-settings.service");
const update_company_settings_dto_1 = require("./dto/update-company-settings.dto");
let CompanySettingsController = class CompanySettingsController {
    companySettingsService;
    constructor(companySettingsService) {
        this.companySettingsService = companySettingsService;
    }
    get() {
        return this.companySettingsService.get();
    }
    update(dto) {
        return this.companySettingsService.update(dto);
    }
};
exports.CompanySettingsController = CompanySettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompanySettingsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(),
    (0, permissions_decorator_1.RequirePermissions)(shared_1.PermissionCode.SETTINGS_MANAGE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_company_settings_dto_1.UpdateCompanySettingsDto]),
    __metadata("design:returntype", void 0)
], CompanySettingsController.prototype, "update", null);
exports.CompanySettingsController = CompanySettingsController = __decorate([
    (0, common_1.Controller)('company-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [company_settings_service_1.CompanySettingsService])
], CompanySettingsController);
//# sourceMappingURL=company-settings.controller.js.map