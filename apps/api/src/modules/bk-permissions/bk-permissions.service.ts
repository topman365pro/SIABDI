import { BadRequestException, Injectable } from "@nestjs/common";
import {
  AttendanceSource,
  AttendanceStatus,
  PermissionState,
  RoleCode
} from "../../generated/prisma/client";
import { PrismaService } from "../../database/prisma.service";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { AttendanceService } from "../attendance/attendance.service";
import { BkDashboardQueryDto, CreateBkPermissionDto } from "./dto";

@Injectable()
export class BkPermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService
  ) {}

  list() {
    return this.prisma.bkLeavePermission.findMany({
      orderBy: [{ attendanceDate: "desc" }, { startPeriodNo: "asc" }]
    });
  }

  getById(id: string) {
    return this.prisma.bkLeavePermission.findUnique({ where: { id } });
  }

  async create(dto: CreateBkPermissionDto, currentUser: CurrentUserPayload) {
    if (!currentUser.roleCodes.includes(RoleCode.BK)) {
      throw new BadRequestException("Only BK can create BK permissions.");
    }

    const approvingStaff = await this.prisma.staff.findFirst({
      where: { userId: currentUser.sub }
    });

    if (!approvingStaff) {
      throw new BadRequestException("Current user is not linked to a staff record.");
    }

    return this.prisma.$transaction(async (tx: any) => {
      const permission = await tx.bkLeavePermission.create({
        data: {
          ...dto,
          attendanceDate: new Date(dto.attendanceDate),
          approvedByStaffId: approvingStaff.id,
          createdByUserId: currentUser.sub,
          status: PermissionState.ACTIVE
        }
      });

      for (let periodNo = dto.startPeriodNo; periodNo <= dto.endPeriodNo; periodNo += 1) {
        const status =
          dto.permissionKind === "SAKIT" ? AttendanceStatus.SAKIT : AttendanceStatus.IZIN;

        const attendance = await this.attendanceService.upsertAttendanceStatus({
          attendanceDate: dto.attendanceDate,
          studentId: dto.studentId,
          classId: dto.classId,
          lessonPeriodNo: periodNo,
          scheduleId: "",
          status,
          source: AttendanceSource.BK_PERMISSION,
          markedByUserId: currentUser.sub,
          note: dto.reason,
          bkPermissionId: permission.id
        });

        await this.attendanceService.insertAuditLog({
          attendancePeriodStatusId: attendance.id,
          previousStatus: null,
          newStatus: status,
          changeSource: AttendanceSource.BK_PERMISSION,
          changedByUserId: currentUser.sub,
          reason: dto.reason,
          metadata: {
            permissionId: permission.id
          }
        });
      }

      return permission;
    });
  }

  async cancel(id: string, currentUser: CurrentUserPayload) {
    const permission = await this.prisma.bkLeavePermission.update({
      where: { id },
      data: { status: PermissionState.CANCELLED }
    });

    await this.attendanceService.recomputeStudentPeriods({
      studentId: permission.studentId,
      classId: permission.classId,
      attendanceDate: permission.attendanceDate,
      startPeriodNo: permission.startPeriodNo,
      endPeriodNo: permission.endPeriodNo,
      actorUserId: currentUser.sub,
      note: `Cancelled BK permission ${id}`
    });

    return permission;
  }

  dashboardStudents(classId: string, query: BkDashboardQueryDto) {
    return this.attendanceService.listClassCurrent(classId, {
      date: query.date,
      periodNo: query.periodNo
    });
  }
}
