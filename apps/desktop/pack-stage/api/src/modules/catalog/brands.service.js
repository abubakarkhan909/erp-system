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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const zod_validate_1 = require("../../common/utils/zod-validate");
const brandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
});
let BrandsService = class BrandsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, pageSize, skip, take, search, sortDir } = (0, pagination_1.parsePagination)(query);
        const where = { deletedAt: null };
        if (search) {
            where.name = { contains: search };
        }
        const [rows, total] = await Promise.all([
            this.prisma.brand.findMany({
                where,
                skip,
                take,
                orderBy: { name: sortDir },
            }),
            this.prisma.brand.count({ where }),
        ]);
        return (0, pagination_1.paginatedResult)(rows, total, page, pageSize);
    }
    async findOne(id) {
        const brand = await this.prisma.brand.findFirst({
            where: { id, deletedAt: null },
        });
        if (!brand)
            throw new common_1.NotFoundException('Brand not found');
        return brand;
    }
    async create(body) {
        const dto = (0, zod_validate_1.zodValidate)(brandSchema, body);
        try {
            return await this.prisma.brand.create({ data: { name: dto.name } });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new common_1.ConflictException('Brand name already exists');
            }
            throw e;
        }
    }
    async update(id, body) {
        await this.findOne(id);
        const dto = (0, zod_validate_1.zodValidate)(brandSchema.partial(), body);
        try {
            return await this.prisma.brand.update({ where: { id }, data: dto });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new common_1.ConflictException('Brand name already exists');
            }
            throw e;
        }
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.brand.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandsService);
//# sourceMappingURL=brands.service.js.map