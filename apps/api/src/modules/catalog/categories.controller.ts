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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequirePermissions('products.read')
  findAll(@Query() query: Record<string, unknown>) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @RequirePermissions('products.write')
  create(@Body() body: unknown) {
    return this.categoriesService.create(body);
  }

  @Patch(':id')
  @RequirePermissions('products.write')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('products.write')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
