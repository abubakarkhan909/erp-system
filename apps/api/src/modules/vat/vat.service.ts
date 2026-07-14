import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalStr, paginatedResult, parsePagination } from '../../common/utils/pagination';
import { vatPeriodRange } from '../../common/utils/date-range';

export type VatReport = {
  label: string;
  year: number;
  month?: number;
  quarter?: number;
  periodType: 'monthly' | 'quarterly' | 'yearly';
  from: string;
  to: string;
  output: {
    taxableSales: string;
    outputVat: string;
    saleReturnTaxable: string;
    saleReturnVat: string;
    netTaxableSales: string;
    netOutputVat: string;
  };
  input: {
    taxablePurchases: string;
    inputVat: string;
    purchaseReturnTaxable: string;
    purchaseReturnVat: string;
    netTaxablePurchases: string;
    netInputVat: string;
  };
  netVat: string;
  locked?: { lockedAt: string } | null;
  documents: {
    sales: Array<{ id: string; number: string; date: string; taxable: string; vatAmount: string }>;
    saleReturns: Array<{ id: string; number: string; date: string; taxable: string; vatAmount: string }>;
    purchases: Array<{ id: string; number: string; date: string; taxable: string; vatAmount: string }>;
    purchaseReturns: Array<{ id: string; number: string; date: string; taxable: string; vatAmount: string }>;
  };
};

@Injectable()
export class VatService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(params: {
    year: number;
    month?: number;
    quarter?: number;
  }): Promise<VatReport> {
    if (!params.year) throw new BadRequestException('year is required');

    let periodType: VatReport['periodType'];
    let range: ReturnType<typeof vatPeriodRange>;

    if (params.month != null) {
      periodType = 'monthly';
      range = vatPeriodRange(params.year, params.month);
    } else if (params.quarter != null) {
      periodType = 'quarterly';
      range = vatPeriodRange(params.year, undefined, params.quarter);
    } else {
      periodType = 'yearly';
      range = vatPeriodRange(params.year);
    }

    const dateFilter = { gte: range.from, lt: range.to };
    const posted = { status: 'POSTED' as const };

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

    const sum = (rows: Array<{ taxable: Prisma.Decimal; vatAmount: Prisma.Decimal }>) =>
      rows.reduce(
        (acc, r) => ({
          taxable: acc.taxable.add(r.taxable),
          vat: acc.vat.add(r.vatAmount),
        }),
        { taxable: new Prisma.Decimal(0), vat: new Prisma.Decimal(0) },
      );

    const salesSum = sum(sales);
    const saleRetSum = sum(saleReturns);
    const purchSum = sum(purchases);
    const purchRetSum = sum(purchaseReturns);

    const netTaxableSales = salesSum.taxable.sub(saleRetSum.taxable);
    const netOutputVat = salesSum.vat.sub(saleRetSum.vat);
    const netTaxablePurchases = purchSum.taxable.sub(purchRetSum.taxable);
    const netInputVat = purchSum.vat.sub(purchRetSum.vat);
    const netVat = netOutputVat.sub(netInputVat);

    const mapDoc = (
      rows: Array<{
        id: string;
        number: string;
        invoiceDate?: Date;
        returnDate?: Date;
        taxable: Prisma.Decimal;
        vatAmount: Prisma.Decimal;
      }>,
      dateField: 'invoiceDate' | 'returnDate',
    ) =>
      rows.map((r) => ({
        id: r.id,
        number: r.number,
        date: (r[dateField] as Date).toISOString().slice(0, 10),
        taxable: decimalStr(r.taxable),
        vatAmount: decimalStr(r.vatAmount),
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
        taxableSales: decimalStr(salesSum.taxable),
        outputVat: decimalStr(salesSum.vat),
        saleReturnTaxable: decimalStr(saleRetSum.taxable),
        saleReturnVat: decimalStr(saleRetSum.vat),
        netTaxableSales: decimalStr(netTaxableSales),
        netOutputVat: decimalStr(netOutputVat),
      },
      input: {
        taxablePurchases: decimalStr(purchSum.taxable),
        inputVat: decimalStr(purchSum.vat),
        purchaseReturnTaxable: decimalStr(purchRetSum.taxable),
        purchaseReturnVat: decimalStr(purchRetSum.vat),
        netTaxablePurchases: decimalStr(netTaxablePurchases),
        netInputVat: decimalStr(netInputVat),
      },
      netVat: decimalStr(netVat),
      locked: locked?.lockedAt ? { lockedAt: locked.lockedAt.toISOString() } : null,
      documents: {
        sales: mapDoc(sales, 'invoiceDate'),
        saleReturns: mapDoc(saleReturns, 'returnDate'),
        purchases: mapDoc(purchases, 'invoiceDate'),
        purchaseReturns: mapDoc(purchaseReturns, 'returnDate'),
      },
    };
  }

  async lockMonth(year: number, month: number) {
    if (!year || !month || month < 1 || month > 12) {
      throw new BadRequestException('Valid year and month (1-12) required');
    }

    const report = await this.getReport({ year, month });
    const existing = await this.prisma.vatReturn.findUnique({
      where: { year_month: { year, month } },
    });
    if (existing?.lockedAt) {
      throw new ConflictException('VAT return already locked for this month');
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
      outputVat: decimalStr(row.outputVat),
      inputVat: decimalStr(row.inputVat),
      netVat: decimalStr(row.netVat),
      taxableSales: decimalStr(row.taxableSales),
      taxablePurchases: decimalStr(row.taxablePurchases),
      lockedAt: row.lockedAt?.toISOString(),
    };
  }

  async listLockedReturns(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(
      query as Parameters<typeof parsePagination>[0],
    );
    const [rows, total] = await Promise.all([
      this.prisma.vatReturn.findMany({
        skip,
        take,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.vatReturn.count(),
    ]);
    return paginatedResult(
      rows.map((r) => ({
        id: r.id,
        year: r.year,
        month: r.month,
        outputVat: decimalStr(r.outputVat),
        inputVat: decimalStr(r.inputVat),
        netVat: decimalStr(r.netVat),
        taxableSales: decimalStr(r.taxableSales),
        taxablePurchases: decimalStr(r.taxablePurchases),
        lockedAt: r.lockedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    );
  }

  async buildExcelBuffer(report: VatReport): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const summary = wb.addWorksheet('Summary');
    summary.addRow(['VAT Report', report.label]);
    summary.addRow(['Period', `${report.from} to ${report.to}`]);
    summary.addRow([]);
    summary.addRow(['Output taxable sales', report.output.netTaxableSales]);
    summary.addRow(['Output VAT', report.output.netOutputVat]);
    summary.addRow(['Input taxable purchases', report.input.netTaxablePurchases]);
    summary.addRow(['Input VAT', report.input.netInputVat]);
    summary.addRow(['Net VAT payable', report.netVat]);

    const addDocSheet = (
      name: string,
      rows: VatReport['documents']['sales'],
    ) => {
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

  async buildPdfBuffer(report: VatReport): Promise<Buffer> {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const page = pdf.addPage([595, 842]);
    let y = 800;
    const line = (text: string, size = 11) => {
      page.drawText(text, { x: 50, y, size, font, color: rgb(0, 0, 0) });
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
}
