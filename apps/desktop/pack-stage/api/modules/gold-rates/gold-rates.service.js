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
exports.GoldRatesService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@jewelry-erp/shared");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const zod_validate_1 = require("../../common/utils/zod-validate");
const serialize_1 = require("../../common/utils/serialize");
function toDateOnly(value) {
    const d = value instanceof Date ? value : new Date(value);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
let GoldRatesService = class GoldRatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, pageSize, skip, take, sortDir } = (0, pagination_1.parsePagination)(query);
        const [rows, total] = await Promise.all([
            this.prisma.goldRate.findMany({
                skip,
                take,
                orderBy: [{ rateDate: sortDir }, { karat: 'asc' }],
            }),
            this.prisma.goldRate.count(),
        ]);
        return (0, pagination_1.paginatedResult)((0, serialize_1.serializeMany)(rows), total, page, pageSize);
    }
    async findOne(id) {
        const rate = await this.prisma.goldRate.findUnique({ where: { id } });
        if (!rate)
            throw new common_1.NotFoundException('Gold rate not found');
        return (0, serialize_1.serializeRecord)(rate);
    }
    async findByDate(dateStr) {
        const rateDate = toDateOnly(dateStr);
        const rates = await this.prisma.goldRate.findMany({
            where: { rateDate },
            orderBy: { karat: 'asc' },
        });
        return {
            rateDate: rateDate.toISOString().slice(0, 10),
            rates: (0, serialize_1.serializeMany)(rates),
        };
    }
    async findLatest() {
        const latest = await this.prisma.goldRate.findFirst({
            orderBy: { rateDate: 'desc' },
        });
        if (!latest) {
            return { rateDate: null, rates: [] };
        }
        const rates = await this.prisma.goldRate.findMany({
            where: { rateDate: latest.rateDate },
            orderBy: { karat: 'asc' },
        });
        return {
            rateDate: latest.rateDate.toISOString().slice(0, 10),
            rates: (0, serialize_1.serializeMany)(rates),
        };
    }
    async upsert(body, userId) {
        const dto = (0, zod_validate_1.zodValidate)(shared_1.goldRateSchema, body);
        const rateDate = toDateOnly(dto.rateDate);
        const rate = await this.prisma.goldRate.upsert({
            where: {
                rateDate_karat: { rateDate, karat: dto.karat },
            },
            create: {
                rateDate,
                karat: dto.karat,
                ratePerGram: dto.ratePerGram,
                createdById: userId,
            },
            update: {
                ratePerGram: dto.ratePerGram,
            },
        });
        return (0, serialize_1.serializeRecord)(rate);
    }
    async create(body, userId) {
        return this.upsert(body, userId);
    }
    async update(id, body) {
        await this.findOne(id);
        const dto = (0, zod_validate_1.zodValidate)(shared_1.goldRateSchema.partial(), body);
        const data = {};
        if (dto.ratePerGram !== undefined)
            data.ratePerGram = dto.ratePerGram;
        if (dto.karat !== undefined)
            data.karat = dto.karat;
        if (dto.rateDate !== undefined)
            data.rateDate = toDateOnly(dto.rateDate);
        const rate = await this.prisma.goldRate.update({
            where: { id },
            data,
        });
        return (0, serialize_1.serializeRecord)(rate);
    }
    async remove(id) {
        await this.findOne(id);
        const rate = await this.prisma.goldRate.delete({ where: { id } });
        return (0, serialize_1.serializeRecord)(rate);
    }
};
exports.GoldRatesService = GoldRatesService;
exports.GoldRatesService = GoldRatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoldRatesService);
//# sourceMappingURL=gold-rates.service.js.map