import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('brands')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @RequirePermissions('products.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @RequirePermissions('products.write')
  create(@Body() body: unknown) {
    return this.brandsService.create(body);
  }

  @Patch(':id')
  @RequirePermissions('products.write')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.brandsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('products.write')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
