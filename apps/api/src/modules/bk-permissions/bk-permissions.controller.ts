import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { RoleCode } from "../../generated/prisma/client";
import { BkDashboardQueryDto, CreateBkPermissionDto } from "./dto";
import { BkPermissionsService } from "./bk-permissions.service";

@ApiTags("bk-permissions")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller()
export class BkPermissionsController {
  constructor(private readonly bkPermissionsService: BkPermissionsService) {}

  @Roles(RoleCode.BK, RoleCode.ADMIN_TU)
  @Get("bk-dashboard/classes/:classId/students")
  dashboardStudents(@Param("classId") classId: string, @Query() query: BkDashboardQueryDto) {
    return this.bkPermissionsService.dashboardStudents(classId, query);
  }

  @Roles(RoleCode.BK)
  @Post("bk-dashboard/status-overrides")
  createStatusOverride(
    @Body() body: CreateBkPermissionDto,
    @CurrentUser() currentUser: CurrentUserPayload
  ) {
    return this.bkPermissionsService.create(body, currentUser);
  }

  @Roles(RoleCode.BK)
  @Patch("bk-dashboard/status-overrides/:id/cancel")
  cancelStatusOverride(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.bkPermissionsService.cancel(id, currentUser);
  }

  @Roles(RoleCode.BK, RoleCode.ADMIN_TU)
  @Post("bk-permissions")
  createBkPermission(@Body() body: CreateBkPermissionDto, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.bkPermissionsService.create(body, currentUser);
  }

  @Roles(RoleCode.BK, RoleCode.ADMIN_TU)
  @Get("bk-permissions")
  list() {
    return this.bkPermissionsService.list();
  }

  @Roles(RoleCode.BK, RoleCode.ADMIN_TU)
  @Get("bk-permissions/:id")
  getById(@Param("id") id: string) {
    return this.bkPermissionsService.getById(id);
  }

  @Roles(RoleCode.BK, RoleCode.ADMIN_TU)
  @Patch("bk-permissions/:id/cancel")
  cancel(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.bkPermissionsService.cancel(id, currentUser);
  }
}
