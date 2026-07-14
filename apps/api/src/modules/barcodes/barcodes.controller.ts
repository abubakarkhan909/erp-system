import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { BarcodesService } from './barcodes.service';

@Controller('barcodes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BarcodesController {
  constructor(private readonly barcodesService: BarcodesService) {}

  @Post('generate/:productId')
  @RequirePermissions('products.write')
  generate(@Param('productId') productId: string) {
    return this.barcodesService.generateForProduct(productId);
  }

  @Get('scan/:code')
  @RequirePermissions('products.read')
  scan(@Param('code') code: string) {
    return this.barcodesService.getByBarcode(code);
  }
}
