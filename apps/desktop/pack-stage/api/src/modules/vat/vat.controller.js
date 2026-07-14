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
exports.VatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const vat_service_1 = require("./vat.service");
let VatController = class VatController {
    vatService;
    constructor(vatService) {
        this.vatService = vatService;
    }
    getReport(year, month, quarter) {
        return this.vatService.getReport({
            year: Number(year),
            month: month != null ? Number(month) : undefined,
            quarter: quarter != null ? Number(quarter) : undefined,
        });
    }
    exportJson(year, month, quarter) {
        return this.vatService.getReport({
            year: Number(year),
            month: month != null ? Number(month) : undefined,
            quarter: quarter != null ? Number(quarter) : undefined,
        });
    }
    async exportExcel(year, month, quarter, res) {
        const report = await this.vatService.getReport({
            year: Number(year),
            month: month != null ? Number(month) : undefined,
            quarter: quarter != null ? Number(quarter) : undefined,
        });
        const buffer = await this.vatService.buildExcelBuffer(report);
        const filename = `vat-${report.label}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    async exportPdf(year, month, quarter, res) {
        const report = await this.vatService.getReport({
            year: Number(year),
            month: month != null ? Number(month) : undefined,
            quarter: quarter != null ? Number(quarter) : undefined,
        });
        const buffer = await this.vatService.buildPdfBuffer(report);
        const filename = `vat-${report.label}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    lockMonth(year, month) {
        return this.vatService.lockMonth(Number(year), Number(month));
    }
    listLocked(query) {
        return this.vatService.listLockedReturns(query);
    }
};
exports.VatController = VatController;
__decorate([
    (0, common_1.Get)('report'),
    (0, permissions_decorator_1.RequirePermissions)('vat.read'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VatController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)('export/json'),
    (0, permissions_decorator_1.RequirePermissions)('vat.export'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VatController.prototype, "exportJson", null);
__decorate([
    (0, common_1.Get)('export/excel'),
    (0, permissions_decorator_1.RequirePermissions)('vat.export'),
    (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('quarter')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VatController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, permissions_decorator_1.RequirePermissions)('vat.export'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('quarter')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VatController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Post)('lock'),
    (0, permissions_decorator_1.RequirePermissions)('vat.export'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VatController.prototype, "lockMonth", null);
__decorate([
    (0, common_1.Get)('returns'),
    (0, permissions_decorator_1.RequirePermissions)('vat.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VatController.prototype, "listLocked", null);
exports.VatController = VatController = __decorate([
    (0, common_1.Controller)('vat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [vat_service_1.VatService])
], VatController);
//# sourceMappingURL=vat.controller.js.map