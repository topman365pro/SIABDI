import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtAccessGuard } from "../src/common/guards/jwt-access.guard";
import { RolesGuard } from "../src/common/guards/roles.guard";
import { RoleCode } from "../src/generated/prisma/client";
import { AttendanceController } from "../src/modules/attendance/attendance.controller";
import { AttendanceService } from "../src/modules/attendance/attendance.service";

describe("AttendanceController (e2e)", () => {
  let app: INestApplication;
  const attendanceService = {
    baseCheck: jest.fn(),
    crossCheck: jest.fn(),
    listClassCurrent: jest.fn(),
    listClassDaily: jest.fn(),
    studentToday: jest.fn(),
    studentHistory: jest.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: attendanceService
        },
      ]
    })
      .overrideGuard(JwtAccessGuard)
      .useValue({
        canActivate(context: any) {
          const requestRef = context.switchToHttp().getRequest();
          requestRef.user = {
            sub: "user-mapel",
            username: "guru.mapel",
            fullName: "Guru Mapel",
            roleCodes: [RoleCode.GURU_MAPEL]
          };
          return true;
        }
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate() {
          return true;
        }
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    );
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("accepts base-check payload and forwards current user context", async () => {
    attendanceService.baseCheck.mockResolvedValue([
      {
        id: "attendance-1",
        status: "HADIR"
      }
    ]);

    const response = await request(app.getHttpServer())
      .post("/api/v1/attendance/base-check")
      .send({
        classId: "2d7d75a1-c873-41db-981e-0ca78425353a",
        scheduleId: "2fc1d66d-4af9-4fa5-b005-63d13d7ac55c",
        attendanceDate: "2026-04-20",
        lessonPeriodNo: 1,
        records: [
          {
            studentId: "7829e706-8efe-42d1-ba32-f4b39826f087",
            status: "HADIR"
          }
        ]
      })
      .expect(201);

    expect(response.body).toEqual([
      {
        id: "attendance-1",
        status: "HADIR"
      }
    ]);
    expect(attendanceService.baseCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonPeriodNo: 1
      }),
      expect.objectContaining({
        roleCodes: [RoleCode.GURU_MAPEL]
      })
    );
  });

  it("serves the class current endpoint", async () => {
    attendanceService.listClassCurrent.mockResolvedValue([
      {
        student: { id: "student-1", fullName: "Siswa 1" },
        status: { id: "status-1", status: "HADIR" }
      }
    ]);

    const response = await request(app.getHttpServer())
      .get("/api/v1/attendance/classes/class-1/current")
      .query({
        date: "2026-04-20",
        periodNo: 1
      })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(attendanceService.listClassCurrent).toHaveBeenCalledWith("class-1", {
      date: "2026-04-20",
      periodNo: 1
    });
  });
});
