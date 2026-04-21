import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AttendanceStatus, RoleCode } from "../../generated/prisma/client";
import { PrismaService } from "../../database/prisma.service";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { AttendanceService } from "../attendance/attendance.service";
import { TeacherObservation } from "../attendance/dto";
import { ParentStudentTimelineQueryDto, TeacherVerifyPeriodDto } from "./dto";

function toDateOnly(date?: string) {
  const value = date ? new Date(date) : new Date();
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function toWeekday(date: Date) {
  return (
    {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY"
    } as const
  )[date.getUTCDay() as 1 | 2 | 3 | 4 | 5 | 6];
}

@Injectable()
export class DashboardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService
  ) {}

  async getAdminOverview(date?: string) {
    const attendanceDate = toDateOnly(date);
    const todayStatuses = await this.prisma.attendancePeriodStatus.findMany({
      where: {
        attendanceDate
      },
      select: {
        status: true
      }
    });

    return {
      counters: {
        activeStudents: await this.prisma.student.count({ where: { isActive: true } }),
        activeClasses: await this.prisma.class.count({ where: { isActive: true } }),
        staffs: await this.prisma.staff.count(),
        parents: await this.prisma.parent.count(),
        pendingDraftDispensations: await this.prisma.dispensation.count({
          where: { status: "DRAFT" }
        })
      },
      attendanceSummary: this.groupAttendanceStatuses(todayStatuses)
    };
  }

  async getBkOverview(date?: string) {
    const attendanceDate = toDateOnly(date);

    return {
      counters: {
        activePermissions: await this.prisma.bkLeavePermission.count({
          where: {
            attendanceDate,
            status: "ACTIVE"
          }
        }),
        sakitAktif: await this.prisma.bkLeavePermission.count({
          where: {
            attendanceDate,
            status: "ACTIVE",
            permissionKind: "SAKIT"
          }
        }),
        izinAktif: await this.prisma.bkLeavePermission.count({
          where: {
            attendanceDate,
            status: "ACTIVE",
            permissionKind: "IZIN"
          }
        }),
        returnRequired: await this.prisma.bkLeavePermission.count({
          where: {
            attendanceDate,
            status: "ACTIVE",
            returnRequired: true
          }
        })
      },
      latestPermissions: await this.prisma.bkLeavePermission.findMany({
        where: {
          attendanceDate
        },
        orderBy: [{ createdAt: "desc" }],
        take: 10,
        include: {
          student: true,
          class: true
        }
      })
    };
  }

  async getKesiswaanOverview(date?: string) {
    const attendanceDate = toDateOnly(date);

    return {
      counters: {
        draftDispensations: await this.prisma.dispensation.count({
          where: { status: "DRAFT" }
        }),
        publishedToday: await this.prisma.dispensation.count({
          where: {
            attendanceDate,
            status: "PUBLISHED"
          }
        }),
        cancelledToday: await this.prisma.dispensation.count({
          where: {
            attendanceDate,
            status: "CANCELLED"
          }
        }),
        participatingStudents: await this.prisma.dispensationStudent.count({
          where: {
            dispensation: {
              attendanceDate,
              status: "PUBLISHED"
            }
          }
        })
      },
      latestDispensations: await this.prisma.dispensation.findMany({
        where: {
          attendanceDate
        },
        orderBy: [{ createdAt: "desc" }],
        take: 10,
        include: {
          students: {
            include: {
              student: true,
              class: true
            }
          }
        }
      })
    };
  }

  async getTeacherSchedules(currentUser: CurrentUserPayload, date?: string) {
    const staff = await this.requireStaff(currentUser.sub);
    const targetDate = toDateOnly(date);
    const weekday = toWeekday(targetDate);

    return this.prisma.classSchedule.findMany({
      where: {
        teacherStaffId: staff.id,
        weekday,
        isActive: true
      },
      orderBy: [{ lessonPeriodNo: "asc" }],
      include: {
        class: true,
        subject: true,
        lessonPeriod: true
      }
    });
  }

  async getTeacherClassPeriod(
    currentUser: CurrentUserPayload,
    classId: string,
    periodNo: number,
    date?: string
  ) {
    const staff = await this.requireStaff(currentUser.sub);
    const targetDate = toDateOnly(date);
    const weekday = toWeekday(targetDate);

    const schedule = await this.prisma.classSchedule.findFirst({
      where: {
        classId,
        lessonPeriodNo: periodNo,
        teacherStaffId: staff.id,
        weekday,
        isActive: true
      },
      include: {
        class: true,
        subject: true,
        lessonPeriod: true
      }
    });

    if (!schedule) {
      throw new NotFoundException("Jadwal guru untuk kelas dan jam tersebut tidak ditemukan.");
    }

    const roster = await this.attendanceService.listClassCurrent(classId, {
      date: targetDate.toISOString(),
      periodNo
    });

    return {
      schedule,
      roster
    };
  }

  async verifyTeacherClassPeriod(
    currentUser: CurrentUserPayload,
    classId: string,
    periodNo: number,
    body: TeacherVerifyPeriodDto
  ) {
    const schedule = await this.getTeacherClassPeriod(
      currentUser,
      classId,
      periodNo,
      body.attendanceDate
    );

    if (periodNo === 1) {
      return this.attendanceService.baseCheck(
        {
          classId,
          scheduleId: body.scheduleId,
          attendanceDate: body.attendanceDate,
          lessonPeriodNo: 1,
          records: body.records.map((record) => ({
            studentId: record.studentId,
            status: record.status ?? "ALFA",
            note: record.note
          }))
        },
        currentUser
      );
    }

    const results = [];

    for (const record of body.records) {
      results.push(
        await this.attendanceService.crossCheck(
          {
            studentId: record.studentId,
            classId,
            attendanceDate: body.attendanceDate,
            lessonPeriodNo: periodNo,
            scheduleId: body.scheduleId,
            teacherObservation: record.teacherObservation ?? TeacherObservation.ABSENT,
            note: record.note
          },
          currentUser
        )
      );
    }

    return {
      schedule: schedule.schedule,
      results
    };
  }

  async getParentStudents(currentUser: CurrentUserPayload) {
    const parent = await this.prisma.parent.findFirst({
      where: { userId: currentUser.sub },
      include: {
        students: {
          include: {
            student: {
              include: {
                enrollments: {
                  where: { isActive: true },
                  include: {
                    class: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!parent) {
      throw new NotFoundException("Akun orang tua tidak terhubung ke data parent.");
    }

    return parent.students.map((link) => ({
      id: link.student.id,
      nis: link.student.nis,
      fullName: link.student.fullName,
      relationship: link.relationship,
      currentClass: link.student.enrollments[0]?.class ?? null
    }));
  }

  async getParentStudentToday(
    currentUser: CurrentUserPayload,
    studentId: string,
    date?: string
  ) {
    await this.assertParentLinkedStudent(currentUser.sub, studentId);
    return this.attendanceService.studentToday(studentId, toDateOnly(date).toISOString());
  }

  async getParentStudentHistory(
    currentUser: CurrentUserPayload,
    studentId: string,
    query: ParentStudentTimelineQueryDto
  ) {
    await this.assertParentLinkedStudent(currentUser.sub, studentId);
    return this.attendanceService.studentHistory(studentId, query);
  }

  private groupAttendanceStatuses(rows: Array<{ status: AttendanceStatus }>) {
    const base = {
      HADIR: 0,
      ALFA: 0,
      IZIN: 0,
      SAKIT: 0,
      DISPENSASI: 0,
      BOLOS: 0
    };

    for (const row of rows) {
      base[row.status] += 1;
    }

    return base;
  }

  private async requireStaff(userId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { userId }
    });

    if (!staff) {
      throw new NotFoundException("Akun user tidak terhubung ke data staff.");
    }

    return staff;
  }

  private async assertParentLinkedStudent(userId: string, studentId: string) {
    const link = await this.prisma.parentStudentLink.findFirst({
      where: {
        studentId,
        parent: {
          userId
        }
      }
    });

    if (!link) {
      throw new ForbiddenException("Student tidak terhubung ke akun parent ini.");
    }
  }
}
