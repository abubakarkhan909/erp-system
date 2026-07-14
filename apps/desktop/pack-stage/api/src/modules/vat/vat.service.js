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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VatService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const exceljs_1 = __importDefault(require("exceljs"));
const pdf_lib_1 = require("pdf-lib");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const date_range_1 = require("../../common/utils/date-range");
let VatService = class VatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getReport(params) {
        if (!params.year)
            throw new common_1.BadRequestException('year is required');
        let periodType;
        let range;
        if (params.month != null) {
            periodType = 'monthly';
            range = (0, date_range_1.vatPeriodRange)(params.year, params.month);
        }
        else if (params.quarter != null) {
            periodType = 'quarterly';
            range = (0, date_range_1.vatPeriodRange)(params.year, undefined, params.quarter);
        }
        else {
            periodType = 'yearly';
            range = (0, date_range_1.vatPeriodRange)(params.year);
        }
        const dateFilter = { gte: range.from, lt: range.to };
        const posted = { status: 'POSTED' };
        const [sales, saleReturns, purchases, purchaseReturns, locked] = await Promise.all([
            this.prisma.saleInvoice.findMany({
                where: { invoiceDate: dateFilter, ...posted, deletedAt: null },
                select: { id: true, number: true, invoiceDate: true, taxable: true, vatAmount: true },
                orderBy: { invoiceDate: 'asc' },
            }),
            this.prisma.saleReturn.findMany({
                where: { returnDate: dateFilter, ...posted },
                select: { id: true, number: true, returnDate: true, taxable: true, vatAmount: true },
                orderBy: { returnDate: 'asc' },
            }),
            this.prisma.purchaseInvoice.findMany({
                where: { invoiceDate: dateFilter, ...posted, deletedAt: null },
                select: { id: true, number: true, invoiceDate: true, taxable: true, vatAmount: true },
                orderBy: { invoiceDate: 'asc' },
            }),
            this.prisma.purchaseReturn.findMany({
                where: { returnDate: dateFilter, ...posted },
                select: { id: true, number: true, returnDate: true, taxable: true, vatAmount: true },
                orderBy: { returnDate: 'asc' },
            }),
            params.month != null
                ? this.prisma.vatReturn.findUnique({
                    where: { year_month: { year: params.year, month: params.month } },
                })
                : Promise.resolve(null),
        ]);
        const sum = (rows) => rows.reduce((acc, r) => ({
            taxable: acc.taxable.add(r.taxable),
            vat: acc.vat.add(r.vatAmount),
        }), { taxable: new client_1.Prisma.Decimal(0), vat: new client_1.Prisma.Decimal(0) });
        const salesSum = sum(sales);
        const saleRetSum = sum(saleReturns);
        const purchSum = sum(purchases);
        const purchRetSum = sum(purchaseReturns);
        const netTaxableSales = salesSum.taxable.sub(saleRetSum.taxable);
        const netOutputVat = salesSum.vat.sub(saleRetSum.vat);
        const netTaxablePurchases = purchSum.taxable.sub(purchRetSum.taxable);
        const netInputVat = purchSum.vat.sub(purchRetSum.vat);
        const netVat = netOutputVat.sub(netInputVat);
        const mapDoc = (rows, dateField) => rows.map((r) => ({
            id: r.id,
            number: r.number,
            date: r[dateField].toISOString().slice(0, 10),
            taxable: (0, pagination_1.decimalStr)(r.taxable),
            vatAmount: (0, pagination_1.decimalStr)(r.vatAmount),
        }));
        return {
            label: range.label,
            year: params.year,
            month: params.month,
            quarter: params.quarter,
            periodType,
            from: range.from.toISOString().slice(0, 10),
            to: new Date(range.to.getTime() - 1).toISOString().slice(0, 10),
            output: {
                taxableSales: (0, pagination_1.decimalStr)(salesSum.taxable),
                outputVat: (0, pagination_1.decimalStr)(salesSum.vat),
                saleReturnTaxable: (0, pagination_1.decimalStr)(saleRetSum.taxable),
                saleReturnVat: (0, pagination_1.decimalStr)(saleRetSum.vat),
                netTaxableSales: (0, pagination_1.decimalStr)(netTaxableSales),
                netOutputVat: (0, pagination_1.decimalStr)(netOutputVat),
            },
            input: {
                taxablePurchases: (0, pagination_1.decimalStr)(purchSum.taxable),
                inputVat: (0, pagination_1.decimalStr)(purchSum.vat),
                purchaseReturnTaxable: (0, pagination_1.decimalStr)(purchRetSum.taxable),
                purchaseReturnVat: (0, pagination_1.decimalStr)(purchRetSum.vat),
                netTaxablePurchases: (0, pagination_1.decimalStr)(netTaxablePurchases),
                netInputVat: (0, pagination_1.decimalStr)(netInputVat),
            },
            netVat: (0, pagination_1.decimalStr)(netVat),
            locked: locked?.lockedAt ? { lockedAt: locked.lockedAt.toISOString() } : null,
            documents: {
                sales: mapDoc(sales, 'invoiceDate'),
                saleReturns: mapDoc(saleReturns, 'returnDate'),
                purchases: mapDoc(purchases, 'invoiceDate'),
                purchaseReturns: mapDoc(purchaseReturns, 'returnDate'),
            },
        };
    }
    async lockMonth(year, month) {
        if (!year || !month || month < 1 || month > 12) {
            throw new common_1.BadRequestException('Valid year and month (1-12) required');
        }
        const report = await this.getReport({ year, month });
        const existing = await this.prisma.vatReturn.findUnique({
            where: { year_month: { year, month } },
        });
        if (existing?.lockedAt) {
            throw new common_1.ConflictException('VAT return already locked for this month');
        }
        const data = {
            year,
            month,
            outputVat: report.output.netOutputVat,
            inputVat: report.input.netInputVat,
            netVat: report.netVat,
            taxableSales: report.output.netTaxableSales,
            taxablePurchases: report.input.netTaxablePurchases,
            lockedAt: new Date(),
        };
        const row = existing
            ? await this.prisma.vatReturn.update({ where: { id: existing.id }, data })
            : await this.prisma.vatReturn.create({ data });
        return {
            id: row.id,
            year: row.year,
            month: row.month,
            outputVat: (0, pagination_1.decimalStr)(row.outputVat),
            inputVat: (0, pagination_1.decimalStr)(row.inputVat),
            netVat: (0, pagination_1.decimalStr)(row.netVat),
            taxableSales: (0, pagination_1.decimalStr)(row.taxableSales),
            taxablePurchases: (0, pagination_1.decimalStr)(row.taxablePurchases),
            lockedAt: row.lockedAt?.toISOString(),
        };
    }
    async listLockedReturns(query) {
        const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(query);
        const [rows, total] = await Promise.all([
            this.prisma.vatReturn.findMany({
                skip,
                take,
                orderBy: [{ year: 'desc' }, { month: 'desc' }],
            }),
            this.prisma.vatReturn.count(),
        ]);
        return (0, pagination_1.paginatedResult)(rows.map((r) => ({
            id: r.id,
            year: r.year,
            month: r.month,
            outputVat: (0, pagination_1.decimalStr)(r.outputVat),
            inputVat: (0, pagination_1.decimalStr)(r.inputVat),
            netVat: (0, pagination_1.decimalStr)(r.netVat),
            taxableSales: (0, pagination_1.decimalStr)(r.taxableSales),
            taxablePurchases: (0, pagination_1.decimalStr)(r.taxablePurchases),
            lockedAt: r.lockedAt?.toISOString() ?? null,
            createdAt: r.createdAt.toISOString(),
        })), total, page, pageSize);
    }
    async buildExcelBuffer(report) {
        const wb = new exceljs_1.default.Workbook();
        const summary = wb.addWorksheet('Summary');
        summary.addRow(['VAT Report', report.label]);
        summary.addRow(['Period', `${report.from} to ${report.to}`]);
        summary.addRow([]);
        summary.addRow(['Output taxable sales', report.output.netTaxableSales]);
        summary.addRow(['Output VAT', report.output.netOutputVat]);
        summary.addRow(['Input taxable purchases', report.input.netTaxablePurchases]);
        summary.addRow(['Input VAT', report.input.netInputVat]);
        summary.addRow(['Net VAT payable', report.netVat]);
        const addDocSheet = (name, rows) => {
            const ws = wb.addWorksheet(name);
            ws.addRow(['Number', 'Date', 'Taxable', 'VAT']);
            for (const r of rows) {
                ws.addRow([r.number, r.date, r.taxable, r.vatAmount]);
            }
        };
        addDocSheet('Sales', report.documents.sales);
        addDocSheet('Sale Returns', report.documents.saleReturns);
        addDocSheet('Purchases', report.documents.purchases);
        addDocSheet('Purchase Returns', report.documents.purchaseReturns);
        const arrayBuffer = await wb.xlsx.writeBuffer();
        return Buffer.from(arrayBuffer);
    }
    async buildPdfBuffer(report) {
        const pdf = await pdf_lib_1.PDFDocument.create();
        const font = await pdf.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const page = pdf.addPage([595, 842]);
        let y = 800;
        const line = (text, size = 11) => {
            page.drawText(text, { x: 50, y, size, font, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
            y -= size + 6;
        };
        line('VAT Return Report', 16);
        line(`Period: ${report.label} (${report.from} - ${report.to})`, 12);
        line('');
        line(`Net taxable sales: ${report.output.netTaxableSales} OMR`);
        line(`Output VAT: ${report.output.netOutputVat} OMR`);
        line(`Net taxable purchases: ${report.input.netTaxablePurchases} OMR`);
        line(`Input VAT: ${report.input.netInputVat} OMR`);
        line(`Net VAT payable: ${report.netVat} OMR`, 12);
        if (report.locked) {
            line(`Locked at: ${report.locked.lockedAt}`);
        }
        return Buffer.from(await pdf.save());
    }
};
exports.VatService = VatService;
exports.VatService = VatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VatService);
//# sourceMappingURL=vat.service.js.map