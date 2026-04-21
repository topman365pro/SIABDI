import { BadRequestException, Injectable } from "@nestjs/common";
import {
  AttendanceSource,
  AttendanceStatus,
  DispensationState,
  RoleCode
} from "../../generated/prisma/client";
import { PrismaService } from "../../database/prisma.service";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { AttendanceService } from "../attendance/attendance.service";
import { AddDispensationStudentsDto, CreateDispensationDto } from "./dto";

@Injectable()
export class DispensationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService
  ) {}

  list() {
    return this.prisma.dispensation.findMany({
      include: { students: true },
      orderBy: [{ attendanceDate: "desc" }, { startPeriodNo: "asc" }]
    });
  }

  getById(id: string) {
    return this.prisma.dispensation.findUnique({
      where: { id },
      include: { students: true }
    });
  }

  create(dto: CreateDispensationDto, currentUser: CurrentUserPayload) {
    return this.prisma.dispensation.create({
      data: {
        ...dto,
        attendanceDate: new Date(dto.attendanceDate),
        createdByUserId: currentUser.sub
      }
    });
  }

  async addStudents(id: string, dto: AddDispensationStudentsDto) {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.dispensationStudent.createMany({
        data: dto.studentIds.map((studentId) => ({
          dispensationId: id,
          studentId,
          classId: dto.classId
        })),
        skipDuplicates: true
      });

      return tx.dispensation.findUnique({
        where: { id },
        include: { students: true }
      });
    });
  }

  async publish(id: string, currentUser: CurrentUserPayload) {
    if (!currentUser.roleCodes.includes(RoleCode.KESISWAAN)) {
      throw new BadRequestException("Only Kesiswaan can publish dispensations.");
    }

    const approvingStaff = await this.prisma.staff.findFirst({
      where: { userId: currentUser.sub }
    });

    if (!approvingStaff) {
      throw new BadRequestException("Current user is not linked to a staff record.");
    }

    const dispensation = await this.prisma.dispensation.update({
      where: { id },
      data: {
        status: DispensationState.PUBLISHED,
        approvedByStaffId: approvingStaff.id,
        publishedAt: new Date()
      },
      include: { students: true }
    });

    for (const student of dispensation.students) {
      for (let periodNo = dispensation.startPeriodNo; periodNo <= dispensation.endPeriodNo; periodNo += 1) {
        const attendance = await this.attendanceService.upsertAttendanceStatus({
          attendanceDate: dispensation.attendanceDate.toISOString(),
          studentId: student.studentId,
          classId: student.classId,
          lessonPeriodNo: periodNo,
          scheduleId: "",
          status: AttendanceStatus.DISPENSASI,
          source: AttendanceSource.DISPENSATION,
          markedByUserId: currentUser.sub,
          note: dispensation.title,
          dispensationId: dispensation.id
        });

        await this.attendanceService.insertAuditLog({
          attendancePeriodStatusId: attendance.id,
          previousStatus: null,
          newStatus: AttendanceStatus.DISPENSASI,
          changeSource: AttendanceSource.DISPENSATION,
          changedByUserId: currentUser.sub,
          reason: dispensation.title,
          metadata: {
            dispensationId: dispensation.id
          }
        });
      }
    }

    return dispensation;
  }

  async cancel(id: string, currentUser: CurrentUserPayload) {
    const dispensation = await this.prisma.dispensation.update({
      where: { id },
      data: {
        status: DispensationState.CANCELLED
      },
      include: { students: true }
    });

    for (const student of dispensation.students) {
      await this.attendanceService.recomputeStudentPeriods({
        studentId: student.studentId,
        classId: student.classId,
        attendanceDate: dispensation.attendanceDate,
        startPeriodNo: dispensation.startPeriodNo,
        endPeriodNo: dispensation.endPeriodNo,
        actorUserId: currentUser.sub,
        note: `Cancelled dispensation ${id}`
      });
    }

    return dispensation;
  }
}
