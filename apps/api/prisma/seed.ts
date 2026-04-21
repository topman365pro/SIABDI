import { config as loadEnv } from "dotenv";
import * as bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AttendanceSource,
  AttendanceStatus,
  BkPermissionKind,
  CalendarDayType,
  DispensationState,
  PermissionState,
  PrismaClient,
  RoleCode,
  StaffPositionCode,
  TapDeviceType,
  TapProcessingStatus,
  TapType,
  WeekdayEnum
} from "../src/generated/prisma/client";

loadEnv({ path: ".env" });
loadEnv({ path: "../../.env", override: false });

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateTime(value: string) {
  return new Date(value);
}

function timeOnly(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString })
  });

  const demoPassword = await bcrypt.hash("Password123!", 10);
  const today = "2026-04-20";
  const academicYearStart = "2025-07-14";
  const academicYearEnd = "2026-06-30";

  try {
    await prisma.role.createMany({
      data: [
        {
          code: RoleCode.ADMIN_TU,
          name: "Admin / TU",
          description: "Akses penuh untuk master data dan administrasi."
        },
        {
          code: RoleCode.KESISWAAN,
          name: "Kesiswaan",
          description: "Otoritas untuk publikasi dispensasi."
        },
        {
          code: RoleCode.BK,
          name: "Bimbingan Konseling",
          description: "Otoritas status izin dan sakit."
        },
        {
          code: RoleCode.GURU_MAPEL,
          name: "Guru Mata Pelajaran",
          description: "Pelaksana absensi base check dan cross-check."
        },
        {
          code: RoleCode.ORANG_TUA,
          name: "Orang Tua",
          description: "Akses baca histori kehadiran siswa."
        }
      ],
      skipDuplicates: true
    });

    await prisma.staffPosition.createMany({
      data: [
        { code: StaffPositionCode.GURU_MAPEL, name: "Guru Mapel" },
        { code: StaffPositionCode.BK, name: "Guru BK" },
        { code: StaffPositionCode.TU, name: "Tata Usaha" },
        { code: StaffPositionCode.KESISWAAN, name: "Kesiswaan" },
        { code: StaffPositionCode.WALI_KELAS, name: "Wali Kelas" }
      ],
      skipDuplicates: true
    });

    const users = await Promise.all([
      prisma.user.upsert({
        where: { username: "admin.tu" },
        update: {
          fullName: "Admin TU",
          passwordHash: demoPassword,
          isActive: true
        },
        create: {
          username: "admin.tu",
          fullName: "Admin TU",
          passwordHash: demoPassword
        }
      }),
      prisma.user.upsert({
        where: { username: "guru.bk" },
        update: {
          fullName: "Guru BK",
          passwordHash: demoPassword,
          isActive: true
        },
        create: {
          username: "guru.bk",
          fullName: "Guru BK",
          passwordHash: demoPassword
        }
      }),
      prisma.user.upsert({
        where: { username: "guru.mapel" },
        update: {
          fullName: "Guru Mapel",
          passwordHash: demoPassword,
          isActive: true
        },
        create: {
          username: "guru.mapel",
          fullName: "Guru Mapel",
          passwordHash: demoPassword
        }
      }),
      prisma.user.upsert({
        where: { username: "petugas.kesiswaan" },
        update: {
          fullName: "Petugas Kesiswaan",
          passwordHash: demoPassword,
          isActive: true
        },
        create: {
          username: "petugas.kesiswaan",
          fullName: "Petugas Kesiswaan",
          passwordHash: demoPassword
        }
      }),
      prisma.user.upsert({
        where: { username: "orangtua.demo" },
        update: {
          fullName: "Orang Tua Demo",
          passwordHash: demoPassword,
          isActive: true
        },
        create: {
          username: "orangtua.demo",
          fullName: "Orang Tua Demo",
          passwordHash: demoPassword
        }
      })
    ]);

    const [adminUser, bkUser, mapelUser, kesiswaanUser, parentUser] = users;

    const staffs = await Promise.all([
      prisma.staff.upsert({
        where: { employeeNumber: "198501010001" },
        update: { fullName: "Admin TU", userId: adminUser.id },
        create: {
          employeeNumber: "198501010001",
          fullName: "Admin TU",
          userId: adminUser.id
        }
      }),
      prisma.staff.upsert({
        where: { employeeNumber: "198601010002" },
        update: { fullName: "Guru BK", userId: bkUser.id },
        create: {
          employeeNumber: "198601010002",
          fullName: "Guru BK",
          userId: bkUser.id
        }
      }),
      prisma.staff.upsert({
        where: { employeeNumber: "198701010003" },
        update: { fullName: "Guru Mapel", userId: mapelUser.id },
        create: {
          employeeNumber: "198701010003",
          fullName: "Guru Mapel",
          userId: mapelUser.id
        }
      }),
      prisma.staff.upsert({
        where: { employeeNumber: "198801010004" },
        update: { fullName: "Petugas Kesiswaan", userId: kesiswaanUser.id },
        create: {
          employeeNumber: "198801010004",
          fullName: "Petugas Kesiswaan",
          userId: kesiswaanUser.id
        }
      })
    ]);

    const [adminStaff, bkStaff, mapelStaff, kesiswaanStaff] = staffs;

    const parent = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: {
        fullName: "Orang Tua Demo",
        phone: "081234567890",
        email: "orangtua.demo@example.com"
      },
      create: {
        userId: parentUser.id,
        fullName: "Orang Tua Demo",
        phone: "081234567890",
        email: "orangtua.demo@example.com"
      }
    });

    await prisma.userRole.deleteMany({
      where: {
        userId: {
          in: users.map((user: { id: string }) => user.id)
        }
      }
    });

    await prisma.userRole.createMany({
      data: [
        { userId: adminUser.id, roleCode: RoleCode.ADMIN_TU },
        { userId: bkUser.id, roleCode: RoleCode.BK },
        { userId: mapelUser.id, roleCode: RoleCode.GURU_MAPEL },
        { userId: kesiswaanUser.id, roleCode: RoleCode.KESISWAAN },
        { userId: parentUser.id, roleCode: RoleCode.ORANG_TUA }
      ],
      skipDuplicates: true
    });

    await prisma.staffPositionAssignment.deleteMany({
      where: {
        staffId: {
          in: staffs.map((staff: { id: string }) => staff.id)
        }
      }
    });

    await prisma.staffPositionAssignment.createMany({
      data: [
        { staffId: adminStaff.id, positionCode: StaffPositionCode.TU, isPrimary: true },
        { staffId: adminStaff.id, positionCode: StaffPositionCode.WALI_KELAS, isPrimary: false },
        { staffId: bkStaff.id, positionCode: StaffPositionCode.BK, isPrimary: true },
        { staffId: mapelStaff.id, positionCode: StaffPositionCode.GURU_MAPEL, isPrimary: true },
        {
          staffId: kesiswaanStaff.id,
          positionCode: StaffPositionCode.KESISWAAN,
          isPrimary: true
        }
      ],
      skipDuplicates: true
    });

    const batch = await prisma.batch.upsert({
      where: { entryYear: 2024 },
      update: {
        name: "Angkatan 2024",
        description: "Peserta didik angkatan masuk 2024."
      },
      create: {
        name: "Angkatan 2024",
        entryYear: 2024,
        description: "Peserta didik angkatan masuk 2024."
      }
    });

    const academicYear = await prisma.academicYear.upsert({
      where: { name: "2025/2026" },
      update: {
        startDate: dateOnly(academicYearStart),
        endDate: dateOnly(academicYearEnd),
        isActive: true
      },
      create: {
        name: "2025/2026",
        startDate: dateOnly(academicYearStart),
        endDate: dateOnly(academicYearEnd),
        isActive: true
      }
    });

    await prisma.academicYear.updateMany({
      where: {
        id: { not: academicYear.id }
      },
      data: {
        isActive: false
      }
    });

    const schoolClass = await prisma.class.upsert({
      where: {
        academicYearId_name: {
          academicYearId: academicYear.id,
          name: "11 IPA 1"
        }
      },
      update: {
        batchId: batch.id,
        gradeLevel: 11,
        major: "IPA",
        parallelCode: "1",
        homeroomStaffId: adminStaff.id,
        isActive: true
      },
      create: {
        academicYearId: academicYear.id,
        batchId: batch.id,
        name: "11 IPA 1",
        gradeLevel: 11,
        major: "IPA",
        parallelCode: "1",
        homeroomStaffId: adminStaff.id
      }
    });

    const subject = await prisma.subject.upsert({
      where: { code: "MAT" },
      update: {
        name: "Matematika",
        isActive: true
      },
      create: {
        code: "MAT",
        name: "Matematika"
      }
    });

    for (const lessonPeriod of [
      { periodNo: 1, label: "Jam 1", startTime: "07:00", endTime: "07:45" },
      { periodNo: 2, label: "Jam 2", startTime: "07:45", endTime: "08:30" },
      { periodNo: 3, label: "Jam 3", startTime: "08:45", endTime: "09:30" },
      { periodNo: 4, label: "Jam 4", startTime: "09:30", endTime: "10:15" },
      { periodNo: 5, label: "Jam 5", startTime: "10:30", endTime: "11:15" },
      { periodNo: 6, label: "Jam 6", startTime: "11:15", endTime: "12:00" },
      { periodNo: 7, label: "Jam 7", startTime: "13:00", endTime: "13:45" },
      { periodNo: 8, label: "Jam 8", startTime: "13:45", endTime: "14:30" },
      { periodNo: 9, label: "Jam 9", startTime: "14:30", endTime: "15:15" },
      { periodNo: 10, label: "Jam 10", startTime: "15:15", endTime: "16:00" }
    ]) {
      await prisma.lessonPeriod.upsert({
        where: { periodNo: lessonPeriod.periodNo },
        update: {
          label: lessonPeriod.label,
          startTime: timeOnly(lessonPeriod.startTime),
          endTime: timeOnly(lessonPeriod.endTime),
          isActive: true
        },
        create: {
          periodNo: lessonPeriod.periodNo,
          label: lessonPeriod.label,
          startTime: timeOnly(lessonPeriod.startTime),
          endTime: timeOnly(lessonPeriod.endTime),
          isActive: true
        }
      });
    }

    const tapDevice = await prisma.tapDevice.upsert({
      where: { deviceCode: "gate-rfid-01" },
      update: {
        deviceName: "Gate RFID 01",
        deviceType: TapDeviceType.RFID,
        locationDescription: "Gerbang depan sekolah",
        isActive: true
      },
      create: {
        deviceCode: "gate-rfid-01",
        deviceName: "Gate RFID 01",
        deviceType: TapDeviceType.RFID,
        locationDescription: "Gerbang depan sekolah"
      }
    });

    const studentInputs = [
      {
        nis: "2024001",
        fullName: "Alya Putri",
        barcodeValue: "BC-2024001",
        rfidUid: "RFID-2024001"
      },
      {
        nis: "2024002",
        fullName: "Bagas Pratama",
        barcodeValue: "BC-2024002",
        rfidUid: "RFID-2024002"
      },
      {
        nis: "2024003",
        fullName: "Citra Lestari",
        barcodeValue: "BC-2024003",
        rfidUid: "RFID-2024003"
      },
      {
        nis: "2024004",
        fullName: "Dimas Saputra",
        barcodeValue: "BC-2024004",
        rfidUid: "RFID-2024004"
      },
      {
        nis: "2024005",
        fullName: "Eka Ramadhani",
        barcodeValue: "BC-2024005",
        rfidUid: "RFID-2024005"
      }
    ];

    const students = [];
    for (const [index, input] of studentInputs.entries()) {
      students.push(
        await prisma.student.upsert({
          where: { nis: input.nis },
          update: {
            batchId: batch.id,
            fullName: input.fullName,
            gender: index % 2 === 0 ? "P" : "L",
            birthDate: dateOnly(`2008-01-${String(index + 10).padStart(2, "0")}`),
            barcodeValue: input.barcodeValue,
            rfidUid: input.rfidUid,
            isActive: true
          },
          create: {
            batchId: batch.id,
            nis: input.nis,
            fullName: input.fullName,
            gender: index % 2 === 0 ? "P" : "L",
            birthDate: dateOnly(`2008-01-${String(index + 10).padStart(2, "0")}`),
            barcodeValue: input.barcodeValue,
            rfidUid: input.rfidUid
          }
        })
      );
    }

    for (const student of students) {
      await prisma.studentClassEnrollment.upsert({
        where: {
          studentId_classId_startDate: {
            studentId: student.id,
            classId: schoolClass.id,
            startDate: dateOnly(academicYearStart)
          }
        },
        update: {
          endDate: null,
          isActive: true
        },
        create: {
          studentId: student.id,
          classId: schoolClass.id,
          startDate: dateOnly(academicYearStart),
          isActive: true
        }
      });
    }

    await prisma.parentStudentLink.upsert({
      where: {
        parentId_studentId: {
          parentId: parent.id,
          studentId: students[0].id
        }
      },
      update: {
        relationship: "Ayah",
        isPrimary: true
      },
      create: {
        parentId: parent.id,
        studentId: students[0].id,
        relationship: "Ayah",
        isPrimary: true
      }
    });

    const schedule = await prisma.classSchedule.upsert({
      where: {
        classId_weekday_lessonPeriodNo: {
          classId: schoolClass.id,
          weekday: WeekdayEnum.MONDAY,
          lessonPeriodNo: 1
        }
      },
      update: {
        academicYearId: academicYear.id,
        subjectId: subject.id,
        teacherStaffId: mapelStaff.id,
        roomName: "Ruang 11 IPA 1",
        isActive: true
      },
      create: {
        academicYearId: academicYear.id,
        classId: schoolClass.id,
        subjectId: subject.id,
        teacherStaffId: mapelStaff.id,
        weekday: WeekdayEnum.MONDAY,
        lessonPeriodNo: 1,
        roomName: "Ruang 11 IPA 1"
      }
    });

    await prisma.schoolCalendarDay.upsert({
      where: { calendarDate: dateOnly(today) },
      update: {
        academicYearId: academicYear.id,
        dayType: CalendarDayType.SCHOOL_DAY,
        title: "Hari Belajar Reguler",
        description: "Hari belajar aktif untuk demo seed.",
        isSchoolDay: true
      },
      create: {
        calendarDate: dateOnly(today),
        academicYearId: academicYear.id,
        dayType: CalendarDayType.SCHOOL_DAY,
        title: "Hari Belajar Reguler",
        description: "Hari belajar aktif untuk demo seed.",
        isSchoolDay: true
      }
    });

    await prisma.tapEvent.deleteMany();
    await prisma.attendanceAuditLog.deleteMany();
    await prisma.attendancePeriodStatus.deleteMany();
    await prisma.dispensationStudent.deleteMany();
    await prisma.dispensation.deleteMany();
    await prisma.bkLeavePermission.deleteMany();

    const izinPermission = await prisma.bkLeavePermission.create({
      data: {
        studentId: students[1].id,
        classId: schoolClass.id,
        attendanceDate: dateOnly(today),
        permissionKind: BkPermissionKind.IZIN,
        startPeriodNo: 5,
        endPeriodNo: 6,
        returnRequired: true,
        expectedReturnPeriodNo: 7,
        reason: "Keperluan keluarga",
        letterNumber: "BK/IZIN/2026/001",
        status: PermissionState.ACTIVE,
        createdByUserId: bkUser.id,
        approvedByStaffId: bkStaff.id
      }
    });

    const sakitPermission = await prisma.bkLeavePermission.create({
      data: {
        studentId: students[2].id,
        classId: schoolClass.id,
        attendanceDate: dateOnly(today),
        permissionKind: BkPermissionKind.SAKIT,
        startPeriodNo: 1,
        endPeriodNo: 10,
        returnRequired: false,
        reason: "Demam dan istirahat di rumah",
        letterNumber: "BK/SAKIT/2026/002",
        status: PermissionState.ACTIVE,
        createdByUserId: bkUser.id,
        approvedByStaffId: bkStaff.id
      }
    });

    const draftDispensation = await prisma.dispensation.create({
      data: {
        title: "Rapat Persiapan Lomba",
        description: "Belum dipublikasikan.",
        attendanceDate: dateOnly(today),
        startPeriodNo: 8,
        endPeriodNo: 9,
        returnRequired: false,
        status: DispensationState.DRAFT,
        createdByUserId: kesiswaanUser.id
      }
    });

    const publishedDispensation = await prisma.dispensation.create({
      data: {
        title: "Lomba OSN Tingkat Kota",
        description: "Peserta mewakili sekolah.",
        attendanceDate: dateOnly(today),
        startPeriodNo: 3,
        endPeriodNo: 4,
        returnRequired: false,
        status: DispensationState.PUBLISHED,
        createdByUserId: kesiswaanUser.id,
        approvedByStaffId: kesiswaanStaff.id,
        publishedAt: dateTime(`${today}T06:00:00.000Z`)
      }
    });

    await prisma.dispensationStudent.createMany({
      data: [
        {
          dispensationId: draftDispensation.id,
          studentId: students[0].id,
          classId: schoolClass.id
        },
        {
          dispensationId: publishedDispensation.id,
          studentId: students[3].id,
          classId: schoolClass.id
        }
      ]
    });

    const seededStatuses = [];

    seededStatuses.push(
      await prisma.attendancePeriodStatus.create({
        data: {
          attendanceDate: dateOnly(today),
          studentId: students[0].id,
          classId: schoolClass.id,
          lessonPeriodNo: 1,
          scheduleId: schedule.id,
          status: AttendanceStatus.HADIR,
          source: AttendanceSource.BASE_CHECK,
          markedByUserId: mapelUser.id,
          note: "Hadir saat base check.",
          verifiedAt: dateTime(`${today}T07:01:00.000Z`)
        }
      })
    );

    seededStatuses.push(
      await prisma.attendancePeriodStatus.create({
        data: {
          attendanceDate: dateOnly(today),
          studentId: students[1].id,
          classId: schoolClass.id,
          lessonPeriodNo: 1,
          scheduleId: schedule.id,
          status: AttendanceStatus.HADIR,
          source: AttendanceSource.BASE_CHECK,
          markedByUserId: mapelUser.id,
          note: "Hadir saat base check.",
          verifiedAt: dateTime(`${today}T07:01:00.000Z`)
        }
      })
    );

    seededStatuses.push(
      await prisma.attendancePeriodStatus.create({
        data: {
          attendanceDate: dateOnly(today),
          studentId: students[2].id,
          classId: schoolClass.id,
          lessonPeriodNo: 1,
          scheduleId: schedule.id,
          status: AttendanceStatus.SAKIT,
          source: AttendanceSource.BK_PERMISSION,
          markedByUserId: bkUser.id,
          note: "Diinput BK sebagai sakit.",
          bkPermissionId: sakitPermission.id,
          verifiedAt: dateTime(`${today}T07:00:00.000Z`)
        }
      })
    );

    seededStatuses.push(
      await prisma.attendancePeriodStatus.create({
        data: {
          attendanceDate: dateOnly(today),
          studentId: students[3].id,
          classId: schoolClass.id,
          lessonPeriodNo: 1,
          scheduleId: schedule.id,
          status: AttendanceStatus.HADIR,
          source: AttendanceSource.BASE_CHECK,
          markedByUserId: mapelUser.id,
          note: "Hadir sebelum dispensasi aktif.",
          verifiedAt: dateTime(`${today}T07:01:00.000Z`)
        }
      })
    );

    seededStatuses.push(
      await prisma.attendancePeriodStatus.create({
        data: {
          attendanceDate: dateOnly(today),
          studentId: students[4].id,
          classId: schoolClass.id,
          lessonPeriodNo: 1,
          scheduleId: schedule.id,
          status: AttendanceStatus.ALFA,
          source: AttendanceSource.BASE_CHECK,
          markedByUserId: mapelUser.id,
          note: "Tidak hadir pada jam pertama.",
          verifiedAt: dateTime(`${today}T07:01:00.000Z`)
        }
      })
    );

    const izinPeriod5 = await prisma.attendancePeriodStatus.create({
      data: {
        attendanceDate: dateOnly(today),
        studentId: students[1].id,
        classId: schoolClass.id,
        lessonPeriodNo: 5,
        status: AttendanceStatus.IZIN,
        source: AttendanceSource.BK_PERMISSION,
        markedByUserId: bkUser.id,
        note: "Izin resmi BK.",
        bkPermissionId: izinPermission.id,
        verifiedAt: dateTime(`${today}T10:30:00.000Z`)
      }
    });

    const izinPeriod6 = await prisma.attendancePeriodStatus.create({
      data: {
        attendanceDate: dateOnly(today),
        studentId: students[1].id,
        classId: schoolClass.id,
        lessonPeriodNo: 6,
        status: AttendanceStatus.IZIN,
        source: AttendanceSource.BK_PERMISSION,
        markedByUserId: bkUser.id,
        note: "Izin resmi BK.",
        previousAttendanceStatusId: izinPeriod5.id,
        bkPermissionId: izinPermission.id,
        verifiedAt: dateTime(`${today}T11:15:00.000Z`)
      }
    });

    seededStatuses.push(izinPeriod5, izinPeriod6);

    seededStatuses.push(
      await prisma.attendancePeriodStatus.create({
        data: {
          attendanceDate: dateOnly(today),
          studentId: students[1].id,
          classId: schoolClass.id,
          lessonPeriodNo: 7,
          status: AttendanceStatus.BOLOS,
          source: AttendanceSource.CROSS_CHECK,
          markedByUserId: mapelUser.id,
          note: "Tidak kembali setelah izin selesai.",
          previousAttendanceStatusId: izinPeriod6.id,
          verifiedAt: dateTime(`${today}T13:00:00.000Z`)
        }
      })
    );

    const dispPeriod3 = await prisma.attendancePeriodStatus.create({
      data: {
        attendanceDate: dateOnly(today),
        studentId: students[3].id,
        classId: schoolClass.id,
        lessonPeriodNo: 3,
        status: AttendanceStatus.DISPENSASI,
        source: AttendanceSource.DISPENSATION,
        markedByUserId: kesiswaanUser.id,
        note: "Dispensasi lomba.",
        dispensationId: publishedDispensation.id,
        verifiedAt: dateTime(`${today}T08:45:00.000Z`)
      }
    });

    seededStatuses.push(dispPeriod3);

    seededStatuses.push(
      await prisma.attendancePeriodStatus.create({
        data: {
          attendanceDate: dateOnly(today),
          studentId: students[3].id,
          classId: schoolClass.id,
          lessonPeriodNo: 4,
          status: AttendanceStatus.DISPENSASI,
          source: AttendanceSource.DISPENSATION,
          markedByUserId: kesiswaanUser.id,
          note: "Dispensasi lomba.",
          previousAttendanceStatusId: dispPeriod3.id,
          dispensationId: publishedDispensation.id,
          verifiedAt: dateTime(`${today}T09:30:00.000Z`)
        }
      })
    );

    await prisma.attendanceAuditLog.createMany({
      data: seededStatuses.map((status) => ({
        attendancePeriodStatusId: status.id,
        previousStatus: null,
        newStatus: status.status,
        changeSource: status.source,
        changedByUserId: status.markedByUserId,
        reason: status.note ?? undefined,
        metadata: {
          seeded: true
        }
      }))
    });

    await prisma.tapEvent.createMany({
      data: [
        {
          studentId: students[0].id,
          nisInput: students[0].nis,
          tapType: TapType.IN,
          tappedAt: dateTime(`${today}T06:45:00.000Z`),
          deviceId: tapDevice.id,
          externalEventId: "tap-demo-001",
          deviceSequence: 1n,
          processingStatus: TapProcessingStatus.RECEIVED
        },
        {
          studentId: students[0].id,
          nisInput: students[0].nis,
          tapType: TapType.OUT,
          tappedAt: dateTime(`${today}T16:05:00.000Z`),
          deviceId: tapDevice.id,
          externalEventId: "tap-demo-002",
          deviceSequence: 2n,
          processingStatus: TapProcessingStatus.RECEIVED
        }
      ]
    });

    console.log("Seed completed.");
    console.table([
      { username: "admin.tu", password: "Password123!", role: "ADMIN_TU" },
      { username: "guru.bk", password: "Password123!", role: "BK" },
      { username: "guru.mapel", password: "Password123!", role: "GURU_MAPEL" },
      { username: "petugas.kesiswaan", password: "Password123!", role: "KESISWAAN" },
      { username: "orangtua.demo", password: "Password123!", role: "ORANG_TUA" }
    ]);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
