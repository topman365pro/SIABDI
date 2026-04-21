import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { RoleCode } from "../../generated/prisma/client";
import {
  ParentStudentTimelineQueryDto,
  TeacherClassPeriodQueryDto,
  TeacherSchedulesQueryDto,
  TeacherVerifyPeriodDto
} from "./dto";
import { DashboardsService } from "./dashboards.service";

@ApiTags("dashboards")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller()
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Roles(RoleCode.ADMIN_TU)
  @Get("admin/overview")
  adminOverview(@Query("date") date?: string) {
    return this.dashboardsService.getAdminOverview(date);
  }

  @Roles(RoleCode.BK, RoleCode.ADMIN_TU)
  @Get("bk/overview")
  bkOverview(@Query("date") date?: string) {
    return this.dashboardsService.getBkOverview(date);
  }

  @Roles(RoleCode.KESISWAAN, RoleCode.ADMIN_TU)
  @Get("kesiswaan/overview")
  kesiswaanOverview(@Query("date") date?: string) {
    return this.dashboardsService.getKesiswaanOverview(date);
  }

  @Roles(RoleCode.GURU_MAPEL, RoleCode.ADMIN_TU)
  @Get("teacher/me/schedules")
  teacherSchedules(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: TeacherSchedulesQueryDto
  ) {
    return this.dashboardsService.getTeacherSchedules(currentUser, query.date);
  }

  @Roles(RoleCode.GURU_MAPEL, RoleCode.ADMIN_TU)
  @Get("teacher/me/classes/:classId/periods/:periodNo")
  teacherClassPeriod(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param("classId") classId: string,
    @Param("periodNo", ParseIntPipe) periodNo: number,
    @Query() query: TeacherClassPeriodQueryDto
  ) {
    return this.dashboardsService.getTeacherClassPeriod(currentUser, classId, periodNo, query.date);
  }

  @Roles(RoleCode.GURU_MAPEL, RoleCode.ADMIN_TU)
  @Post("teacher/me/classes/:classId/periods/:periodNo/verify")
  verifyTeacherClassPeriod(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param("classId") classId: string,
    @Param("periodNo", ParseIntPipe) periodNo: number,
    @Body() body: TeacherVerifyPeriodDto
  ) {
    return this.dashboardsService.verifyTeacherClassPeriod(currentUser, classId, periodNo, body);
  }

  @Roles(RoleCode.ORANG_TUA)
  @Get("parent/me/students")
  parentStudents(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.dashboardsService.getParentStudents(currentUser);
  }

  @Roles(RoleCode.ORANG_TUA)
  @Get("parent/me/students/:studentId/today")
  parentStudentToday(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param("studentId") studentId: string,
    @Query("date") date?: string
  ) {
    return this.dashboardsService.getParentStudentToday(currentUser, studentId, date);
  }

  @Roles(RoleCode.ORANG_TUA)
  @Get("parent/me/students/:studentId/history")
  parentStudentHistory(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param("studentId") studentId: string,
    @Query() query: ParentStudentTimelineQueryDto
  ) {
    return this.dashboardsService.getParentStudentHistory(currentUser, studentId, query);
  }
}
