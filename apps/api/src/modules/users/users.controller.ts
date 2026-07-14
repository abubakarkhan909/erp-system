import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionCode } from '@jewelry-erp/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesDto, UpdateUserDto } from './dto/update-user.dto';
import { SetRecoveryKeyDto, SetSecurityQuestionsDto } from './dto/security.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('roles')
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  listRoles() {
    return this.usersService.listRoles();
  }

  @Get('recovery-key/status')
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  recoveryStatus() {
    return this.usersService.getRecoveryKeyStatus();
  }

  @Get()
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: 'asc' | 'desc',
  ) {
    return this.usersService.list({ page, pageSize, search, sortBy, sortDir });
  }

  @Post()
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.id, dto);
  }

  @Patch(':id')
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, id, dto);
  }

  @Put(':id/roles')
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  assignRoles(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
  ) {
    return this.usersService.assignRoles(user.id, id, dto);
  }

  @Put(':id/security-questions')
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  setQuestions(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: SetSecurityQuestionsDto,
  ) {
    return this.usersService.setSecurityQuestions(user.id, id, dto.questions);
  }

  @Put('recovery-key')
  @RequirePermissions(PermissionCode.USERS_MANAGE)
  setRecoveryKey(
    @CurrentUser() user: { id: string },
    @Body() dto: SetRecoveryKeyDto,
  ) {
    return this.usersService.setOwnerRecoveryKey(user.id, dto.recoveryKey);
  }
}
