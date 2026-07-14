import {
  Controller,
  Get,
  Header,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { VatService } from './vat.service';

@Controller('vat')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VatController {
  constructor(private readonly vatService: VatService) {}

  @Get('report')
  @RequirePermissions('vat.read')
  getReport(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
  ) {
    return this.vatService.getReport({
      year: Number(year),
      month: month != null ? Number(month) : undefined,
      quarter: quarter != null ? Number(quarter) : undefined,
    });
  }

  @Get('export/json')
  @RequirePermissions('vat.export')
  exportJson(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
  ) {
    return this.vatService.getReport({
      year: Number(year),
      month: month != null ? Number(month) : undefined,
      quarter: quarter != null ? Number(quarter) : undefined,
    });
  }

  @Get('export/excel')
  @RequirePermissions('vat.export')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportExcel(
    @Query('year') year: string,
    @Query('month') month: string | undefined,
    @Query('quarter') quarter: string | undefined,
    @Res() res: Response,
  ) {
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

  @Get('export/pdf')
  @RequirePermissions('vat.export')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(
    @Query('year') year: string,
    @Query('month') month: string | undefined,
    @Query('quarter') quarter: string | undefined,
    @Res() res: Response,
  ) {
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

  @Post('lock')
  @RequirePermissions('vat.export')
  lockMonth(@Query('year') year: string, @Query('month') month: string) {
    return this.vatService.lockMonth(Number(year), Number(month));
  }

  @Get('returns')
  @RequirePermissions('vat.read')
  listLocked(@Query() query: Record<string, unknown>) {
    return this.vatService.listLockedReturns(query);
  }
}
