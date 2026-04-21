import { BadRequestException, Injectable } from "@nestjs/common";
import {
  AttendanceSource,
  AttendanceStatus,
  type AttendancePeriodStatus,
  PermissionState,
  DispensationState,
  Prisma
} from "../../generated/prisma/client";
import { PrismaService } from "../../database/prisma.service";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { AttendanceCrossCheckService } from "./attendance-crosscheck.service";
import type {
  ActiveAuthorization,
  AttendanceCrossCheckRepository,
  AttendanceSnapshot,
  ReturnExpectation,
  StoredAttendanceStatus,
  UpsertAttendancePayload
} from "./attendance-crosscheck.service";
import {
  AttendanceCurrentQueryDto,
  AttendanceHistoryQueryDto,
  BaseCheckDto,
  TeacherObservation
} from "./dto";

@Injectable()
export class AttendanceService implements AttendanceCrossCheckRepository {
  private readonly crossCheckResolver = new AttendanceCrossCheckService(this);

  constructor(private readonly prisma: PrismaService) {}

  async baseCheck(dto: BaseCheckDto, currentUser: CurrentUserPayload) {
    if (dto.lessonPeriodNo !== 1) {
      throw new BadRequestException("Base check only applies to lesson period 1.");
    }

    return this.prisma.$transaction(async () => {
      const results: StoredAttendanceStatus[] = [];

      for (const record of dto.records) {
        const authorization = await this.getActiveAuthorization({
          studentId: record.studentId,
          attendanceDate: dto.attendanceDate,
          lessonPeriodNo: dto.lessonPeriodNo
        });

        const finalStatus =
          authorization?.type === "DISPENSATION"
            ? AttendanceStatus.DISPENSASI
            : authorization?.type === "BK_PERMISSION"
              ? authorization.attendanceStatus ?? AttendanceStatus.IZIN
              : record.status;

        const saved = await this.upsertAttendanceStatus({
          attendanceDate: dto.attendanceDate,
          studentId: record.studentId,
          classId: dto.classId,
          lessonPeriodNo: dto.lessonPeriodNo,
          scheduleId: dto.scheduleId,
          status: finalStatus,
          source: authorization?.type === "DISPENSATION"
            ? AttendanceSource.DISPENSATION
            : authorization?.type === "BK_PERMISSION"
              ? AttendanceSource.BK_PERMISSION
              : AttendanceSource.BASE_CHECK,
          markedByUserId: currentUser.sub,
          note: record.note,
          bkPermissionId:
            authorization?.type === "BK_PERMISSION" ? authorization.referenceId : undefined,
          dispensationId:
            authorization?.type === "DISPENSATION" ? authorization.referenceId : undefined
        });

        await this.insertAuditLog({
          attendancePeriodStatusId: saved.id,
          previousStatus: null,
          newStatus: finalStatus,
          changeSource: authorization?.type === "DISPENSATION"
            ? AttendanceSource.DISPENSATION
            : authorization?.type === "BK_PERMISSION"
              ? AttendanceSource.BK_PERMISSION
              : AttendanceSource.BASE_CHECK,
          changedByUserId: currentUser.sub,
          reason: record.note,
          metadata: {
            physicalStatus: record.status,
            overlaidByAuthorization: authorization?.type ?? null
          }
        });

        results.push(saved);
      }

      return results;
    });
  }

  crossCheck(
    input: {
      studentId: string;
      classId: string;
      attendanceDate: string;
      lessonPeriodNo: number;
      scheduleId: string;
      teacherObservation: TeacherObservation;
      note?: string;
    },
    currentUser: CurrentUserPayload
  ) {
    return this.crossCheckResolver.crossCheckPeriod({
      ...input,
      actorUserId: currentUser.sub
    });
  }

  async listClassCurrent(classId: string, query: AttendanceCurrentQueryDto) {
    const attendanceDate = new Date(query.date);
    const students = await this.prisma.studentClassEnrollment.findMany({
      where: {
        classId,
        startDate: { lte: attendanceDate },
        OR: [{ endDate: null }, { endDate: { gte: attendanceDate } }],
        isActive: true
      },
      include: {
        student: true
      }
    });

    const statuses = await this.prisma.attendancePeriodStatus.findMany({
      where: {
        classId,
        attendanceDate,
        lessonPeriodNo: query.periodNo
      }
    });

    const statusByStudent = new Map(
      statuses.map((status: AttendancePeriodStatus) => [status.studentId, status])
    );

    return students.map((enrollment: (typeof students)[number]) => ({
      student: enrollment.student,
      status: statusByStudent.get(enrollment.studentId) ?? null
    }));
  }

  async listClassDaily(classId: string, date: string) {
    return this.prisma.attendancePeriodStatus.findMany({
      where: {
        classId,
        attendanceDate: new Date(date)
      },
      orderBy: [{ lessonPeriodNo: "asc" }, { studentId: "asc" }]
    });
  }

  async studentToday(studentId: string, date: string) {
    return this.prisma.attendancePeriodStatus.findMany({
      where: {
        studentId,
        attendanceDate: new Date(date)
      },
      orderBy: { lessonPeriodNo: "asc" }
    });
  }

  async studentHistory(studentId: string, query: AttendanceHistoryQueryDto) {
    return this.prisma.attendancePeriodStatus.findMany({
      where: {
        studentId,
        attendanceDate: this.buildDateFilter(query)
      },
      orderBy: [{ attendanceDate: "desc" }, { lessonPeriodNo: "asc" }]
    });
  }

  async recomputeStudentPeriods(input: {
    studentId: string;
    classId: string;
    attendanceDate: Date;
    startPeriodNo: number;
    endPeriodNo: number;
    actorUserId: string;
    note?: string;
  }) {
    const results: StoredAttendanceStatus[] = [];

    for (let periodNo = input.startPeriodNo; periodNo <= input.endPeriodNo; periodNo += 1) {
      if (periodNo === 1) {
        const previous = await this.prisma.attendancePeriodStatus.findUnique({
          where: {
            attendanceDate_studentId_lessonPeriodNo: {
              attendanceDate: input.attendanceDate,
              studentId: input.studentId,
              lessonPeriodNo: 1
            }
          }
        });

        const authorization = await this.getActiveAuthorization({
          studentId: input.studentId,
          attendanceDate: input.attendanceDate.toISOString(),
          lessonPeriodNo: 1
        });

        if (authorization) {
          results.push(
            await this.upsertAttendanceStatus({
              attendanceDate: input.attendanceDate.toISOString(),
              studentId: input.studentId,
              classId: input.classId,
              lessonPeriodNo: 1,
              scheduleId: previous?.scheduleId ?? "",
              status:
                authorization.type === "DISPENSATION"
                  ? AttendanceStatus.DISPENSASI
                  : authorization.attendanceStatus ?? AttendanceStatus.IZIN,
              source:
                authorization.type === "DISPENSATION"
                  ? AttendanceSource.DISPENSATION
                  : AttendanceSource.BK_PERMISSION,
              markedByUserId: input.actorUserId,
              note: input.note,
              previousAttendanceStatusId: previous?.id,
              bkPermissionId:
                authorization.type === "BK_PERMISSION" ? authorization.referenceId : undefined,
              dispensationId:
                authorization.type === "DISPENSATION" ? authorization.referenceId : undefined
            })
          );
        } else if (previous) {
          results.push(
            await this.upsertAttendanceStatus({
              attendanceDate: input.attendanceDate.toISOString(),
              studentId: input.studentId,
              classId: input.classId,
              lessonPeriodNo: 1,
              scheduleId: previous.scheduleId ?? "",
              status: AttendanceStatus.ALFA,
              source: AttendanceSource.MANUAL_ADMIN,
              markedByUserId: input.actorUserId,
              note: input.note,
              previousAttendanceStatusId: previous.id
            })
          );
        }
        continue;
      }

      results.push(
        await this.crossCheckResolver.crossCheckPeriod({
          studentId: input.studentId,
          classId: input.classId,
          attendanceDate: input.attendanceDate.toISOString(),
          lessonPeriodNo: periodNo,
          scheduleId: "",
          actorUserId: input.actorUserId,
          note: input.note,
          teacherObservation: TeacherObservation.ABSENT
        })
      );
    }

    return results;
  }

  async withTransaction<T>(callback: (repo: AttendanceCrossCheckRepository) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(() => callback(this));
  }

  async getPreviousStatus(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<AttendanceSnapshot | null> {
    return this.prisma.attendancePeriodStatus.findFirst({
      where: {
        studentId: input.studentId,
        attendanceDate: new Date(input.attendanceDate),
        lessonPeriodNo: { lt: input.lessonPeriodNo }
      },
      orderBy: { lessonPeriodNo: "desc" }
    });
  }

  async hasAnyPresenceBefore(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<boolean> {
    const count = await this.prisma.attendancePeriodStatus.count({
      where: {
        studentId: input.studentId,
        attendanceDate: new Date(input.attendanceDate),
        lessonPeriodNo: { lt: input.lessonPeriodNo },
        status: AttendanceStatus.HADIR
      }
    });

    return count > 0;
  }

  async getActiveAuthorization(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<ActiveAuthorization | null> {
    const attendanceDate = new Date(input.attendanceDate);

    const dispensation = await this.prisma.dispensationStudent.findFirst({
      where: {
        studentId: input.studentId,
        dispensation: {
          attendanceDate,
          status: DispensationState.PUBLISHED,
          startPeriodNo: { lte: input.lessonPeriodNo },
          endPeriodNo: { gte: input.lessonPeriodNo }
        }
      },
      include: { dispensation: true }
    });

    if (dispensation) {
      return {
        type: "DISPENSATION",
        referenceId: dispensation.dispensationId
      };
    }

    const permission = await this.prisma.bkLeavePermission.findFirst({
      where: {
        studentId: input.studentId,
        attendanceDate,
        status: PermissionState.ACTIVE,
        startPeriodNo: { lte: input.lessonPeriodNo },
        endPeriodNo: { gte: input.lessonPeriodNo }
      }
    });

    if (!permission) {
      return null;
    }

    return {
      type: "BK_PERMISSION",
      referenceId: permission.id,
      attendanceStatus:
        permission.permissionKind === "SAKIT" ? AttendanceStatus.SAKIT : AttendanceStatus.IZIN
    };
  }

  async getOutstandingReturnExpectation(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<ReturnExpectation | null> {
    const attendanceDate = new Date(input.attendanceDate);

    const dispensation = await this.prisma.dispensationStudent.findFirst({
      where: {
        studentId: input.studentId,
        dispensation: {
          attendanceDate,
          status: DispensationState.PUBLISHED,
          returnRequired: true,
          expectedReturnPeriodNo: { lte: input.lessonPeriodNo },
          endPeriodNo: { lt: input.lessonPeriodNo }
        }
      },
      include: { dispensation: true }
    });

    if (dispensation?.dispensation.expectedReturnPeriodNo) {
      return {
        type: "DISPENSATION",
        referenceId: dispensation.dispensationId,
        expectedReturnPeriodNo: dispensation.dispensation.expectedReturnPeriodNo
      };
    }

    const permission = await this.prisma.bkLeavePermission.findFirst({
      where: {
        studentId: input.studentId,
        attendanceDate,
        status: PermissionState.ACTIVE,
        returnRequired: true,
        expectedReturnPeriodNo: { lte: input.lessonPeriodNo },
        endPeriodNo: { lt: input.lessonPeriodNo }
      }
    });

    if (!permission?.expectedReturnPeriodNo) {
      return null;
    }

    return {
      type: "BK_PERMISSION",
      referenceId: permission.id,
      expectedReturnPeriodNo: permission.expectedReturnPeriodNo
    };
  }

  async upsertAttendanceStatus(payload: UpsertAttendancePayload): Promise<StoredAttendanceStatus> {
    const attendanceDate = new Date(payload.attendanceDate);
    const existing = await this.prisma.attendancePeriodStatus.findUnique({
      where: {
        attendanceDate_studentId_lessonPeriodNo: {
          attendanceDate,
          studentId: payload.studentId,
          lessonPeriodNo: payload.lessonPeriodNo
        }
      }
    });

    if (existing) {
      return this.prisma.attendancePeriodStatus.update({
        where: { id: existing.id },
        data: {
          classId: payload.classId,
          scheduleId: payload.scheduleId || null,
          status: payload.status,
          source: payload.source,
          note: payload.note,
          markedByUserId: payload.markedByUserId,
          previousAttendanceStatusId: payload.previousAttendanceStatusId,
          bkPermissionId: payload.bkPermissionId,
          dispensationId: payload.dispensationId,
          verifiedAt: new Date()
        }
      });
    }

    return this.prisma.attendancePeriodStatus.create({
      data: {
        attendanceDate,
        studentId: payload.studentId,
        classId: payload.classId,
        lessonPeriodNo: payload.lessonPeriodNo,
        scheduleId: payload.scheduleId || null,
        status: payload.status,
        source: payload.source,
        note: payload.note,
        markedByUserId: payload.markedByUserId,
        previousAttendanceStatusId: payload.previousAttendanceStatusId,
        bkPermissionId: payload.bkPermissionId,
        dispensationId: payload.dispensationId,
        verifiedAt: new Date()
      }
    });
  }

  async insertAuditLog(payload: {
    attendancePeriodStatusId: string;
    previousStatus: AttendanceStatus | null;
    newStatus: AttendanceStatus;
    changeSource: AttendanceSource;
    changedByUserId: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.attendanceAuditLog.create({
      data: {
        attendancePeriodStatusId: payload.attendancePeriodStatusId,
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
        changeSource: payload.changeSource,
        changedByUserId: payload.changedByUserId,
        reason: payload.reason,
        metadata: (payload.metadata ?? {}) as Prisma.InputJsonValue
      }
    });
  }

  private buildDateFilter(query: AttendanceHistoryQueryDto) {
    if (query.date) {
      return new Date(query.date);
    }

    if (query.startDate || query.endDate) {
      return {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined
      };
    }

    return undefined;
  }
}
