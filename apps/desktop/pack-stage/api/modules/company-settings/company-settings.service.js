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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySettingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
let CompanySettingsService = class CompanySettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get() {
        const company = await this.prisma.company.findFirst({
            orderBy: { createdAt: 'asc' },
        });
        if (!company) {
            throw new common_1.NotFoundException('Company settings not configured');
        }
        return this.serialize(company);
    }
    async update(dto) {
        const existing = await this.prisma.company.findFirst({
            orderBy: { createdAt: 'asc' },
        });
        const data = {
            name: dto.name,
            logoPath: dto.logoPath !== undefined ? dto.logoPath : undefined,
            address: dto.address !== undefined ? dto.address : undefined,
            phone: dto.phone !== undefined ? dto.phone : undefined,
            email: dto.email !== undefined ? dto.email : undefined,
            crNumber: dto.crNumber !== undefined ? dto.crNumber : undefined,
            vatNumber: dto.vatNumber !== undefined ? dto.vatNumber : undefined,
            currency: dto.currency ?? 'OMR',
            defaultVatRate: dto.defaultVatRate
                ? new client_1.Prisma.Decimal(dto.defaultVatRate)
                : undefined,
            invoicePrefix: dto.invoicePrefix !== undefined ? dto.invoicePrefix : undefined,
            receiptFooter: dto.receiptFooter !== undefined ? dto.receiptFooter : undefined,
        };
        const company = existing
            ? await this.prisma.company.update({
                where: { id: existing.id },
                data,
            })
            : await this.prisma.company.create({ data });
        return this.serialize(company);
    }
    serialize(company) {
        return {
            id: company.id,
            name: company.name,
            logoPath: company.logoPath,
            address: company.address,
            phone: company.phone,
            email: company.email,
            crNumber: company.crNumber,
            vatNumber: company.vatNumber,
            currency: company.currency,
            defaultVatRate: (0, pagination_1.decimalStr)(company.defaultVatRate),
            invoicePrefix: company.invoicePrefix,
            receiptFooter: company.receiptFooter,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };
    }
};
exports.CompanySettingsService = CompanySettingsService;
exports.CompanySettingsService = CompanySettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanySettingsService);
//# sourceMappingURL=company-settings.service.js.map