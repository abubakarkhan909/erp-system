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
exports.NumberSeriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let NumberSeriesService = class NumberSeriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async nextNumber(docType, prefix, tx) {
        const year = new Date().getFullYear();
        const run = async (db) => {
            const existing = await db.numberSeries.findUnique({
                where: { docType_year: { docType, year } },
            });
            if (existing) {
                const updated = await db.numberSeries.update({
                    where: { id: existing.id },
                    data: { nextValue: { increment: 1 } },
                });
                const number = updated.nextValue - 1;
                return `${updated.prefix}-${year}-${String(number).padStart(5, '0')}`;
            }
            const created = await db.numberSeries.create({
                data: {
                    docType,
                    prefix,
                    year,
                    nextValue: 2,
                },
            });
            return `${created.prefix}-${year}-${String(1).padStart(5, '0')}`;
        };
        if (tx) {
            return run(tx);
        }
        return this.prisma.$transaction((transaction) => run(transaction));
    }
};
exports.NumberSeriesService = NumberSeriesService;
exports.NumberSeriesService = NumberSeriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NumberSeriesService);
//# sourceMappingURL=number-series.service.js.map