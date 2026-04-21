import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { RoleCode } from "../../generated/prisma/client";
import {
  AttendanceCurrentQueryDto,
  AttendanceHistoryQueryDto,
  BaseCheckDto,
  CrossCheckDto
} from "./dto";
import { AttendanceService } from "./attendance.service";

@ApiTags("attendance")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(RoleCode.ADMIN_TU, RoleCode.GURU_MAPEL)
  @Post("base-check")
  baseCheck(@Body() body: BaseCheckDto, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.attendanceService.baseCheck(body, currentUser);
  }

  @Roles(RoleCode.GURU_MAPEL, RoleCode.ADMIN_TU)
  @Post("cross-check")
  crossCheck(@Body() body: CrossCheckDto, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.attendanceService.crossCheck(body, currentUser);
  }

  @Roles(RoleCode.ADMIN_TU, RoleCode.GURU_MAPEL, RoleCode.BK, RoleCode.KESISWAAN)
  @Get("classes/:classId/current")
  classCurrent(@Param("classId") classId: string, @Query() query: AttendanceCurrentQueryDto) {
    return this.attendanceService.listClassCurrent(classId, query);
  }

  @Roles(RoleCode.ADMIN_TU, RoleCode.GURU_MAPEL, RoleCode.BK, RoleCode.KESISWAAN)
  @Get("classes/:classId/daily")
  classDaily(@Param("classId") classId: string, @Query("date") date: string) {
    return this.attendanceService.listClassDaily(classId, date);
  }

  @Roles(RoleCode.ADMIN_TU, RoleCode.GURU_MAPEL, RoleCode.BK, RoleCode.KESISWAAN)
  @Get("students/:studentId/today")
  studentToday(@Param("studentId") studentId: string, @Query("date") date: string) {
    return this.attendanceService.studentToday(studentId, date);
  }

  @Roles(RoleCode.ADMIN_TU, RoleCode.GURU_MAPEL, RoleCode.BK, RoleCode.KESISWAAN)
  @Get("students/:studentId/history")
  studentHistory(@Param("studentId") studentId: string, @Query() query: AttendanceHistoryQueryDto) {
    return this.attendanceService.studentHistory(studentId, query);
  }
}
