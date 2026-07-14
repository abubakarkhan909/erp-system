import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PermissionCode } from '@jewelry-erp/shared';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Controller('company-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Get()
  get() {
    return this.companySettingsService.get();
  }

  @Patch()
  @RequirePermissions(PermissionCode.SETTINGS_MANAGE)
  update(@Body() dto: UpdateCompanySettingsDto) {
    return this.companySettingsService.update(dto);
  }
}
